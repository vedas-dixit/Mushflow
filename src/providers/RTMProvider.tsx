"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AgoraRTM from 'agora-rtm-sdk';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addMessage, updateParticipants, updatePlaybackState, setRTMConnected } from '@/redux/features/jamSlice';
import { useSession } from 'next-auth/react';

// Define the RTM context type
interface RTMContextType {
  isConnected: boolean;
  joinChannel: (roomId: string) => Promise<void>;
  leaveChannel: () => Promise<void>;
  sendChannelMessage: (content: string, messageType: 'USER_MESSAGE' | 'SYSTEM_MESSAGE') => Promise<boolean>;
  sendPlaybackCommand: (action: 'PLAY' | 'PAUSE' | 'CHANGE_TRACK', trackId?: string) => Promise<boolean>;
}

// Create the context with a default value
const RTMContext = createContext<RTMContextType>({
  isConnected: false,
  joinChannel: async () => {},
  leaveChannel: async () => {},
  sendChannelMessage: async () => false,
  sendPlaybackCommand: async () => false,
});

// Custom hook to use the RTM context
export const useRTM = () => useContext(RTMContext);

interface RTMProviderProps {
  children: ReactNode;
}

export function RTMProvider({ children }: RTMProviderProps) {
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const userId = session?.user?.id || 'anonymous';
  const userName = session?.user?.name || 'Anonymous User';
  
  // Initialize the RTM client
  useEffect(() => {
    // Only initialize if we have the Agora App ID
    const appId = "065fc4b84f774499815dd029a02cd7a0";
    if (!appId) {
      console.error('Agora App ID is not defined');
      return;
    }
    
    console.log('Initializing Agora RTM client with App ID:', appId);
    
    // Try to get the Agora RTM SDK from either the import or the global object
    const rtmSDK = AgoraRTM || (typeof window !== 'undefined' ? (window as any).AgoraRTM : null);
    
    if (!rtmSDK) {
      console.error('Agora RTM SDK not found. Make sure it is properly loaded.');
      return;
    }
    
    console.log('Available Agora RTM SDK methods:', Object.keys(rtmSDK));
    
    // Inspect the AgoraRTM object in detail
    console.log('AgoraRTM SDK version:', rtmSDK.VERSION || 'unknown');
    console.log('AgoraRTM RTM constructor:', rtmSDK.RTM);
    
    // Create the RTM client using the correct method for v2.x
    try {
      // For Agora RTM SDK v2.x
      console.log('Creating RTM client instance...');
      
      // Check if RTM is available
      if (!rtmSDK.RTM) {
        console.error('RTM constructor is not available. SDK version might be incompatible.');
        console.log('RTM SDK object:', rtmSDK);
        return;
      }
      
      // Extract RTM constructor from AgoraRTM
      const { RTM } = rtmSDK;
      console.log('RTM constructor available:', !!RTM);
      
      // Initialize with both appId and userId
      const rtmClient = new RTM(appId, userId);
      console.log('RTM client created successfully:', rtmClient);
      console.log('RTM client methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(rtmClient)));
      
      // Set up event listeners
      console.log('Setting up event listeners...');
      
      // Connection state changed event handler
      const statusHandler = (event: any) => {
        console.log('RTM connection state changed:', event);
        const connected = event.state === 'CONNECTED';
        setIsConnected(connected);
        dispatch(setRTMConnected(connected));
      };
      
      rtmClient.addEventListener("status", statusHandler);
      
      // Set the client
      setClient(rtmClient);
      console.log('RTM client initialized and ready for use');
      
      // Clean up on unmount
      return () => {
        if (rtmClient) {
          console.log('Cleaning up RTM client...');
          // Remove event listeners
          rtmClient.removeEventListener("status", statusHandler);
          
          // Logout if connected
          if (isConnected) {
            rtmClient.logout().catch((err: Error) => {
              console.error('Error logging out of RTM client:', err);
            });
          }
        }
      };
    } catch (error) {
      console.error('Error initializing RTM client:', error);
      console.log('RTM SDK object:', rtmSDK);
    }
  }, [dispatch, userId]); // Add userId as a dependency
  
  // Join a channel
  const joinChannel = async (roomId: string) => {
    if (!client) {
      console.error('RTM client is not initialized');
      return;
    }
    
    try {
      console.log('Joining RTM channel for room:', roomId);
      console.log('RTM client instance:', client);
      console.log('RTM client methods available:', 
        'login' in client, 
        'subscribe' in client, 
        'publish' in client,
        'addEventListener' in client
      );
      
      // Get a token from the server
      console.log('Requesting RTM token for user:', userId);
      const response = await fetch(`/api/jam/rtm/token?userId=${userId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get RTM token');
      }
      
      console.log('Received RTM token:', data.token.substring(0, 20) + '...');
      
      // Login to RTM with the token
      console.log('Logging in to RTM...');
      try {
        console.log('Login method exists:', typeof client.login);
        const loginResult = await client.login({ token: data.token });
        console.log('RTM login successful:', loginResult);
      } catch (loginError) {
        console.error('RTM login failed:', loginError);
        throw loginError;
      }
      
      // Define event handlers
      const messageHandler = (event: any) => {
        console.log('Received channel message:', event);
        try {
          if (typeof event.message === 'string') {
            const parsedMessage = JSON.parse(event.message);
            
            // Handle different message types
            if (parsedMessage.type === 'USER_MESSAGE' || parsedMessage.type === 'SYSTEM_MESSAGE') {
              console.log('Processing message:', parsedMessage);
              dispatch(addMessage({
                id: parsedMessage.id,
                senderId: parsedMessage.senderId,
                senderName: parsedMessage.senderName,
                content: parsedMessage.content,
                timestamp: parsedMessage.timestamp,
                type: parsedMessage.type
              }));
            } else if (parsedMessage.type === 'PLAYBACK_COMMAND') {
              console.log('Processing playback command:', parsedMessage);
              dispatch(updatePlaybackState({
                isPlaying: parsedMessage.isPlaying,
                currentTrack: parsedMessage.currentTrack,
                trackStartTime: parsedMessage.trackStartTime
              }));
            }
          }
        } catch (error) {
          console.error('Error parsing RTM message:', error);
        }
      };
      
      const presenceHandler = (event: any) => {
        console.log('Presence event:', event);
        if (event.eventType === "SNAPSHOT") {
          console.log('Joined channel, users present:', event.snapshot);
        } else if (event.type === "REMOTE_JOIN") {
          console.log('User joined:', event.publisher);
        } else if (event.type === "REMOTE_LEAVE") {
          console.log('User left:', event.publisher);
        }
      };
      
      // Remove any existing event listeners to avoid duplicates
      console.log('Removing existing event listeners...');
      try {
        client.removeEventListener("message", messageHandler);
        client.removeEventListener("presence", presenceHandler);
      } catch (error) {
        console.error('Error removing event listeners:', error);
      }
      
      // Set up message event listener
      console.log('Setting up message event listener...');
      try {
        client.addEventListener("message", messageHandler);
      } catch (error) {
        console.error('Error adding message event listener:', error);
      }
      
      // Set up presence event listener
      console.log('Setting up presence event listener...');
      try {
        client.addEventListener("presence", presenceHandler);
      } catch (error) {
        console.error('Error adding presence event listener:', error);
      }
      
      // Subscribe to the channel
      console.log('Subscribing to channel:', roomId);
      try {
        console.log('Subscribe method exists:', typeof client.subscribe);
        const subscribeResult = await client.subscribe(roomId);
        console.log('Channel subscription successful:', subscribeResult);
      } catch (subscribeError) {
        console.error('Channel subscription failed:', subscribeError);
        throw subscribeError;
      }
      
      // Store the channel ID
      setCurrentRoomId(roomId);
      
      console.log('Successfully subscribed to RTM channel:', roomId);
      setIsConnected(true);
      dispatch(setRTMConnected(true));
      
      // Send a test message to verify the connection
      console.log('Sending test message to verify connection...');
      try {
        console.log('Publish method exists:', typeof client.publish);
        const testMessage = JSON.stringify({
          type: 'SYSTEM_MESSAGE',
          id: Date.now().toString(),
          senderId: 'system',
          senderName: 'System',
          content: `${userName} connected to RTM`,
          timestamp: new Date().toISOString()
        });
        console.log('Test message content:', testMessage);
        await client.publish(roomId, testMessage);
        console.log('Test message sent successfully');
      } catch (publishError) {
        console.error('Failed to send test message:', publishError);
      }
    } catch (error) {
      console.error('Error joining RTM channel:', error);
      setIsConnected(false);
      dispatch(setRTMConnected(false));
    }
  };
  
  // Leave the channel
  const leaveChannel = async () => {
    if (!client || !currentRoomId) {
      return;
    }
    
    try {
      console.log('Unsubscribing from RTM channel:', currentRoomId);
      await client.unsubscribe(currentRoomId);
      console.log('Logging out of RTM...');
      await client.logout();
      
      setCurrentRoomId(null);
      setIsConnected(false);
      dispatch(setRTMConnected(false));
      
      console.log('Successfully left RTM channel');
    } catch (error) {
      console.error('Error leaving RTM channel:', error);
    }
  };
  
  // Send a message to the channel
  const sendChannelMessage = async (content: string, messageType: 'USER_MESSAGE' | 'SYSTEM_MESSAGE') => {
    if (!client || !isConnected || !currentRoomId) {
      console.error('Cannot send message: not connected to RTM channel');
      return false;
    }
    
    try {
      const messageId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      const messageData = {
        type: messageType,
        id: messageId,
        senderId: userId,
        senderName: userName,
        content,
        timestamp
      };
      
      console.log('Sending RTM message:', messageData);
      await client.publish(currentRoomId, JSON.stringify(messageData));
      console.log('Message sent successfully');
      
      // Add the message to our own state as well
      dispatch(addMessage({
        id: messageId,
        senderId: userId,
        senderName: userName,
        content,
        timestamp,
        type: messageType
      }));
      
      return true;
    } catch (error) {
      console.error('Error sending RTM message:', error);
      return false;
    }
  };
  
  // Send a playback command to the channel
  const sendPlaybackCommand = async (action: 'PLAY' | 'PAUSE' | 'CHANGE_TRACK', trackId?: string) => {
    if (!client || !isConnected || !currentRoomId) {
      console.error('Cannot send playback command: not connected to RTM channel');
      return false;
    }
    
    try {
      const commandData = {
        type: 'PLAYBACK_COMMAND',
        action,
        trackId,
        senderId: userId,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending RTM playback command:', commandData);
      await client.publish(currentRoomId, JSON.stringify(commandData));
      console.log('Playback command sent successfully');
      
      // Also send to the server for persistence
      console.log('Sending playback command to server for persistence');
      await fetch(`/api/jam/rooms/${currentRoomId}/playback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, trackId }),
      });
      
      return true;
    } catch (error) {
      console.error('Error sending playback command:', error);
      return false;
    }
  };
  
  // Provide the RTM context
  const contextValue: RTMContextType = {
    isConnected,
    joinChannel,
    leaveChannel,
    sendChannelMessage,
    sendPlaybackCommand,
  };
  
  return (
    <RTMContext.Provider value={contextValue}>
      {children}
    </RTMContext.Provider>
  );
} 