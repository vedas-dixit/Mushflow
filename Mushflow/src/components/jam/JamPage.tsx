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
  setParticipants, 
  setCurrentTrack,
  addMessage 
} from '@/redux/features/jamSlice';
import { getMockRoomData } from '@/redux/mockData';
import { showLogin } from '@/redux/features/authSlice';

export default function JamPage() {
  const dispatch = useAppDispatch();
  const jamState = useAppSelector(state => state.jam) as JamState;
  const { user, status } = useAppSelector(state => state.auth);

  // Handle leaving a room
  const handleLeaveRoom = () => {
    dispatch(leaveRoom());
  };

  // Handle room creation or joining
  const handleRoomEntered = (roomId: string, roomCode: string, roomName: string, bannerId: string) => {
    // First set the basic room data
    dispatch(setRoomData({ roomId, roomCode, roomName, bannerId }));
    
    // Then populate with mock data
    if (user) {
      const mockData = getMockRoomData(
        user.id || 'anonymous', 
        user.name || 'Anonymous User'
      );
      
      // Set participants
      dispatch(setParticipants(mockData.participants));
      
      // Set current track
      dispatch(setCurrentTrack({
        track: mockData.currentTrack,
        startTime: mockData.trackStartTime
      }));
      
      // Add join message
      mockData.messages.forEach(message => {
        dispatch(addMessage(message));
      });
    }
  };

  // Show login modal if user is not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      dispatch(showLogin());
    }
  }, [status, dispatch]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
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
    <div className="min-h-screen bg-neutral-900 text-white">
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