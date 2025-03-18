"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AgoraRTM from 'agora-rtm-sdk';
import { useAppDispatch } from '@/redux/hooks';
import { addMessage, updateParticipants, updatePlaybackState, setRTMConnected, addParticipant, removeParticipant } from '@/redux/features/jamSlice';
import { useSession } from 'next-auth/react';

// Define the RTM context type
interface RTMContextType {
  isConnected: boolean;
  joinChannel: (roomId: string) => Promise<void>;
  leaveChannel: () => Promise<void>;
  sendChannelMessage: (content: string, messageType: 'USER_MESSAGE' | 'SYSTEM_MESSAGE') => Promise<boolean>;
  sendPlaybackCommand: (action: 'PLAY' | 'PAUSE' | 'CHANGE_TRACK', trackId?: string) => Promise<boolean>;
  sendParticipantUpdate: (action: 'JOIN' | 'LEAVE', roomId?: string) => Promise<boolean>;
}

// Create the context with a default value
const RTMContext = createContext<RTMContextType>({
  isConnected: false,
  joinChannel: async () => {},
  leaveChannel: async () => {},
  sendChannelMessage: async () => false,
  sendPlaybackCommand: async () => false,
  sendParticipantUpdate: async () => false,
});

// Custom hook to use the RTM context
export const useRTM = () => useContext(RTMContext);

interface RTMProviderProps {
  children: ReactNode;
}

interface Participant {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: string;
}

// interface Track {
//   id: string;
//   title: string;
//   artist: string;
//   duration: number;
//   url: string;
//   attribution: string;
// }

// interface PlaybackState {
//   isPlaying: boolean;
//   currentTrack: Track | null;
//   trackStartTime: string | null;
// }

export function RTMProvider({ children }: RTMProviderProps) {
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  // const [participants, setParticipants] = useState<Participant[]>([]);
  
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const userId = session?.user?.id || 'anonymous';
  const userName = session?.user?.name || 'Anonymous User';
  
  // Initialize the RTM client
  useEffect(() => {
    // Only initialize if we have the Agora App ID
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
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
    
    // If we're already connected to a channel, leave it first
    if (currentRoomId) {
      console.log('Already connected to a channel, leaving it first');
      await leaveChannel();
      // Wait a moment for the channel to be properly left
      await new Promise(resolve => setTimeout(resolve, 500));
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
            // Log the raw message for debugging
            console.log('Raw message string:', event.message);
            
            const parsedMessage = JSON.parse(event.message);
            console.log('Parsed message:', parsedMessage);
            
            // Handle different message types
            if (parsedMessage.type === 'USER_MESSAGE' || parsedMessage.type === 'SYSTEM_MESSAGE') {
              console.log('Processing message:', parsedMessage);
              
              // Only add messages from other users to avoid duplicates
              // We already added our own messages in sendChannelMessage
              if (parsedMessage.senderId !== userId) {
                dispatch(addMessage({
                  id: parsedMessage.id,
                  senderId: parsedMessage.senderId,
                  senderName: parsedMessage.senderName,
                  content: parsedMessage.content,
                  timestamp: parsedMessage.timestamp,
                  type: parsedMessage.type
                }));
              }
            } else if (parsedMessage.type === 'PARTICIPANT_UPDATE') {
              console.log('Processing participant update:', parsedMessage);
              
              // Only process updates from other users to avoid duplicates
              if (parsedMessage.senderId !== userId) {
                const { action, participant } = parsedMessage;
                
                if (action === 'JOIN') {
                  console.log('Adding participant to list:', participant);
                  dispatch(addParticipant(participant));
                } else if (action === 'LEAVE') {
                  console.log('Removing participant from list:', participant.id);
                  dispatch(removeParticipant(participant.id));
                }
              } else {
                console.log('Ignoring participant update from self');
              }
            } else if (parsedMessage.type === 'PLAYBACK_COMMAND') {
              console.log('Processing playback command:', parsedMessage);
              
              // Only process commands from other users to avoid duplicates
              if (parsedMessage.senderId !== userId) {
                if (parsedMessage.action === 'CHANGE_TRACK') {
                  if (parsedMessage.track) {
                    dispatch(updatePlaybackState({
                      isPlaying: true,
                      currentTrack: parsedMessage.track,
                      trackStartTime: parsedMessage.timestamp
                    }));
                  } else if (parsedMessage.trackId) {
                    // If we don't have the track object, try to find it in the Redux store
                    const state = (window as any).__REDUX_STORE__?.getState();
                    if (state?.jam?.availableTracks) {
                      const track = state.jam.availableTracks.find((t: any) => t.id === parsedMessage.trackId);
                      if (track) {
                        dispatch(updatePlaybackState({
                          isPlaying: true,
                          currentTrack: track,
                          trackStartTime: parsedMessage.timestamp
                        }));
                      }
                    }
                  }
                } else {
                  dispatch(updatePlaybackState({
                    isPlaying: parsedMessage.action === 'PLAY',
                    currentTrack: parsedMessage.track || null,
                    trackStartTime: parsedMessage.action === 'PLAY' ? parsedMessage.timestamp : null
                  }));
                }
              } else {
                console.log('Ignoring playback command from self to avoid duplicate state updates');
              }
            }
          }
        } catch (error) {
          console.error('Error parsing RTM message:', error);
          console.error('Raw message that caused error:', event.message);
        }
      };
      
      const presenceHandler = (event: any) => {
        console.log('Presence event:', event);
        
        if (event.eventType === "SNAPSHOT") {
          console.log('Joined channel, users present:', event.snapshot);
          
          // Convert snapshot to participants
          const newParticipants: Participant[] = event.snapshot.map((user: any) => ({
            id: user.userId,
            name: user.userName,
            isActive: true,
            joinedAt: new Date().toISOString()
          }));
          
          // // Update local state
          // setParticipants(newParticipants);
          dispatch(updateParticipants(newParticipants));
          
          // Send a system message that we joined
          if (client && currentRoomId) {
            const joinMessage = {
              type: 'SYSTEM_MESSAGE',
              id: Date.now().toString(),
              senderId: 'system',
              senderName: 'System',
              content: `${userName} joined the room`,
              timestamp: new Date().toISOString()
            };
            
            // Add to our own state
            dispatch(addMessage({
              id: joinMessage.id,
              senderId: joinMessage.senderId,
              senderName: joinMessage.senderName,
              content: joinMessage.content,
              timestamp: joinMessage.timestamp,
              type: 'SYSTEM_MESSAGE'
            }));
            
            // Send to others
            client.publish(currentRoomId, JSON.stringify(joinMessage))
              .catch((err: Error) => console.error('Error sending join message:', err));
          }
        } else if (event.eventType === "REMOTE_JOIN") {
          console.log('User joined (REMOTE_JOIN):', event.publisher);
          // We'll handle this through the PARTICIPANT_UPDATE message
        } else if (event.eventType === "REMOTE_LEAVE") {
          console.log('User left (REMOTE_LEAVE):', event.publisher);
          // We'll handle this through the PARTICIPANT_UPDATE message
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
        await client.subscribe(roomId);
        console.log('Successfully subscribed to channel:', roomId);
        
        // Set the current room ID and connection state
        setCurrentRoomId(roomId);
        setIsConnected(true);
        dispatch(setRTMConnected(true));
        
        // Log the client connection state
        console.log('RTM client connection state after joining:', {
          clientState: client._connectionState,
          isConnectedState: true
        });
        
        // Note: We don't add ourselves to the participants list here anymore
        // This will be handled by the sendParticipantUpdate method when called with 'JOIN'
        // This prevents duplicate entries and ensures consistent behavior
        
        console.log('Successfully joined channel:', roomId);
      } catch (subscribeError) {
        console.error('Error subscribing to channel:', subscribeError);
        throw subscribeError;
      }
    } catch (error) {
      console.error('Error joining channel:', error);
      setIsConnected(false);
      dispatch(setRTMConnected(false));
      throw error;
    }
  };
  
  // Leave a channel
  const leaveChannel = async () => {
    if (!client || !isConnected || !currentRoomId) {
      console.log('Not connected to any channel, nothing to leave');
      return;
    }
    
    try {
      console.log('Leaving RTM channel:', currentRoomId);
      
      // Remove ourselves from the participants list
      dispatch(removeParticipant(userId));
      
      // Unsubscribe from the channel
      await client.unsubscribe(currentRoomId);
      console.log('Successfully unsubscribed from channel:', currentRoomId);
      
      // Clear the current room ID and connection state
      setCurrentRoomId(null);
      // setParticipants([]);
      setIsConnected(false);
      dispatch(setRTMConnected(false));
      
      console.log('Successfully left channel');
    } catch (error) {
      console.error('Error leaving channel:', error);
      // Still clear the state even if there was an error
      setCurrentRoomId(null);
      // setParticipants([]);
      setIsConnected(false);
      dispatch(setRTMConnected(false));
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
      
      // Only dispatch local messages for the sender
      if (messageType === 'USER_MESSAGE') {
        // Add the message to the Redux store for the sender
        dispatch(addMessage({
          id: messageId,
          senderId: userId,
          senderName: userName,
          content,
          timestamp,
          type: messageType
        }));
        
        // Call the API to persist the message
        try {
          await fetch(`/api/jam/rooms/${currentRoomId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(messageData),
          });
        } catch (error) {
          console.error('Error persisting message:', error);
        }
      }
      
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
      const timestamp = new Date().toISOString();
      
      // For CHANGE_TRACK, we need to find the track object
      let track = null;
      if (action === 'CHANGE_TRACK' && trackId) {
        // Get the track from the Redux store
        const state = (window as any).__REDUX_STORE__?.getState();
        if (state?.jam?.availableTracks) {
          track = state.jam.availableTracks.find((t: any) => t.id === trackId);
        }
        
        if (!track) {
          console.error('Track not found:', trackId);
          return false;
        }
      } else if (action !== 'CHANGE_TRACK') {
        // For PLAY/PAUSE, get the current track from the store
        const state = (window as any).__REDUX_STORE__?.getState();
        if (state?.jam?.currentTrack) {
          track = state.jam.currentTrack;
        }
      }
      
      const commandData = {
        type: 'PLAYBACK_COMMAND',
        action,
        trackId: track?.id || trackId,
        track,
        senderId: userId,
        timestamp
      };
      
      console.log('Sending RTM playback command:', commandData);
      
      // First update local state to ensure UI responds immediately
      if (action === 'CHANGE_TRACK' && track) {
        dispatch(updatePlaybackState({
          isPlaying: true,
          currentTrack: track,
          trackStartTime: timestamp
        }));
      } else {
        dispatch(updatePlaybackState({
          isPlaying: action === 'PLAY',
          currentTrack: track || null,
          trackStartTime: action === 'PLAY' ? timestamp : null
        }));
      }
      
      // Then send the command to RTM
      await client.publish(currentRoomId, JSON.stringify(commandData));
      console.log('Playback command sent successfully');
      
      // Also send to the server for persistence
      console.log('Sending playback command to server for persistence');
      await fetch(`/api/jam/rooms/${currentRoomId}/playback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          trackId: track?.id || trackId
        }),
      });
      
      return true;
    } catch (error) {
      console.error('Error sending playback command:', error);
      return false;
    }
  };
  
  // Send a participant update (join/leave)
  const sendParticipantUpdate = async (action: 'JOIN' | 'LEAVE', roomIdParam?: string) => {
    // Use the provided roomId parameter or fall back to the state variable
    const targetRoomId = roomIdParam || currentRoomId;
    
    if (!client) {
      console.error('Cannot send participant update: RTM client is not initialized');
      return false;
    }
    
    if (!targetRoomId) {
      console.error('Cannot send participant update: No room ID provided');
      return false;
    }
    
    try {
      const messageId = Date.now().toString();
      const timestamp = new Date().toISOString();
      
      // Simple participant object
      const participant = {
        id: userId,
        name: userName,
        isActive: action === 'JOIN',
        joinedAt: timestamp
      };
      
      // Simple message structure - similar to playback commands
      const messageData = {
        type: 'PARTICIPANT_UPDATE',
        id: messageId,
        action,
        participant,
        senderId: userId,
        timestamp
      };
      
      console.log(`Sending ${action} participant update:`, messageData);
      
      // Publish directly
      await client.publish(targetRoomId, JSON.stringify(messageData));
      console.log('Participant update sent successfully');
      
      // Update local state immediately - just like playback commands
      if (action === 'JOIN') {
        dispatch(addParticipant(participant));
      } else {
        dispatch(removeParticipant(userId));
      }
      
      return true;
    } catch (error) {
      console.error('Error sending participant update:', error);
      return false;
    }
  };
  
  // Provide the RTM context
  // const contextValue: RTMContextType = {
  //   isConnected,
  //   joinChannel,
  //   leaveChannel,
  //   sendChannelMessage,
  //   sendPlaybackCommand,
  //   sendParticipantUpdate,
  // };
  
  return (
    <RTMContext.Provider value={{
      isConnected,
      joinChannel,
      leaveChannel,
      sendChannelMessage,
      sendPlaybackCommand,
      sendParticipantUpdate
    }}>
      {children}
    </RTMContext.Provider>
  );
} 