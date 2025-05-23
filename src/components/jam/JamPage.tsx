"use client";

import React, { useEffect } from 'react';
import JamSelection from './JamSelection';
import JamRoom from './JamRoom';
import { Music } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { 
  leaveRoom, 
  setRoomData, 
  JamState, 
  fetchRoomDetails,
  leaveCurrentRoom,
  fetchTracks,
  setRTMConnected
} from '@/redux/features/jamSlice';
import { showLogin } from '@/redux/features/authSlice';
import { useRTM } from '@/providers/RTMProvider';

interface AuthState {
  user: {
    id: string;
    name: string;
  } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

export default function JamPage() {
  const dispatch = useAppDispatch();
  const jamState = useAppSelector(state => state.jam) as JamState;
  const { user, status } = useAppSelector(state => state.auth) as AuthState;
  const rtm = useRTM();

  // Handle leaving a room
  const handleLeaveRoom = async () => {
    if (jamState.roomId) {
      try {
        console.log("Leaving room:", jamState.roomId);
        
        // First send leave participant update via RTM
        console.log("Sending leave participant update via RTM...");
        await rtm.sendParticipantUpdate('LEAVE', jamState.roomId);
        
        // Wait a moment to ensure the message is delivered
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Then leave RTM channel
        console.log("Leaving RTM channel...");
        await rtm.leaveChannel();
        dispatch(setRTMConnected(false));
        
        // Finally leave room via API
        console.log("Leaving room via API...");
        await dispatch(leaveCurrentRoom(jamState.roomId));
        console.log("Successfully left room");
      } catch (error) {
        console.error('Failed to leave room:', error);
        // Fallback to local state cleanup if API call fails
        dispatch(leaveRoom());
      }
    } else {
      dispatch(leaveRoom());
    }
  };

  // Handle room creation or joining
  const handleRoomEntered = async (roomId: string, roomCode: string, roomName: string, bannerId: number) => {
    console.log("Room entered:", { roomId, roomCode, roomName, bannerId });
    
    // First set the basic room data
    dispatch(setRoomData({ roomId, roomCode, roomName, bannerId }));
    
    // Then fetch room details
    try {
      if (roomId) {
        console.log("Fetching room details for room:", roomId);
        await dispatch(fetchRoomDetails(roomId));
        
        // Initialize RTM connection
        console.log("Initializing RTM connection for room:", roomId);
        try {
          // First ensure we're not already connected
          if (rtm.isConnected) {
            console.log("Already connected to RTM, leaving current channel first");
            await rtm.leaveChannel();
            // Wait a moment for the channel to be properly left
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Join the new channel
          await rtm.joinChannel(roomId);
          console.log("Successfully joined RTM channel for room:", roomId);
          dispatch(setRTMConnected(true));
          
          // Wait a moment for the channel to be fully joined
          console.log("Waiting for RTM channel to be fully joined...");
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Send join participant update via RTM
          console.log("Sending join participant update via RTM...");
          const updateSuccess = await rtm.sendParticipantUpdate('JOIN', roomId);
          if (updateSuccess) {
            console.log("Successfully sent join participant update");
          } else {
            console.error("Failed to send join participant update");
            // Try again after a short delay
            console.log("Retrying participant update after delay...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await rtm.sendParticipantUpdate('JOIN', roomId);
          }
          
          // Fetch room details again after joining to ensure we have the latest data
          setTimeout(() => {
            console.log("Fetching room details again after joining RTM");
            dispatch(fetchRoomDetails(roomId));
          }, 2000);
        } catch (rtmError) {
          console.error("Failed to join RTM channel:", rtmError);
          dispatch(setRTMConnected(false));
          // Continue with the app even if RTM fails - we'll fall back to polling
        }
      } else {
        console.error("Room ID is undefined or empty");
      }
    } catch (error) {
      console.error('Failed to fetch room details:', error);
    }
  };

  // Fetch tracks when component mounts
  useEffect(() => {
    dispatch(fetchTracks());
  }, [dispatch]);

  // Show login modal if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      dispatch(showLogin());
    }
  }, [status, dispatch]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="h-full bg-neutral-900 text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="bg-amber-500/20 p-4 rounded-full mb-4">
            <Music size={32} className="text-amber-500" />
          </div>
          <p className="text-neutral-400">Loading JAM session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (the login modal will be shown by the AuthSyncProvider)
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="h-lful bg-neutral-900 text-white pointer-events-auto">
      {!jamState.inRoom ? (
        <JamSelection 
          onRoomCreated={handleRoomEntered}
          onRoomJoined={handleRoomEntered}
          userId={user?.id || 'anonymous'}
          userName={user?.name || 'Anonymous User'}
        />
      ) : (
        <JamRoom
          roomId={jamState.roomId || ''}
          roomCode={jamState.roomCode || ''}
          roomName={jamState.roomName || ''}
          userId={user?.id || 'anonymous'}
          userName={user?.name || 'Anonymous User'}
          onLeaveRoom={handleLeaveRoom}
        />
      )}
    </div>
  );
} 