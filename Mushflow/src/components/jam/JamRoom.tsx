"use client";

import React from 'react';
import RoomHeader from './RoomHeader';
import MusicPlayer from './MusicPlayer';
import MusicVisualization from './MusicVisualization';
import ParticipantsList from './ParticipantsList';
import ChatArea from './ChatArea';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { JamState, addMessage, setVolume, setPlaybackState } from '@/redux/features/jamSlice';

interface JamRoomProps {
  roomId: string;
  roomCode: string;
  roomName: string;
  userId: string;
  userName: string;
  onLeaveRoom: () => void;
}

export default function JamRoom({
  roomId,
  roomCode,
  roomName,
  userId,
  userName,
  onLeaveRoom
}: JamRoomProps) {
  const dispatch = useAppDispatch();
  const jamState = useAppSelector(state => state.jam) as JamState;
  
  // Handle sending a new message
  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: userName,
      content,
      timestamp: Date.now(),
      type: 'text' as const
    };
    
    dispatch(addMessage(newMessage));
  };
  
  // Handle copying room code
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    // Could add a toast notification here
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    dispatch(setVolume(newVolume));
  };

  // Handle play/pause toggle
  const handlePlayPause = () => {
    dispatch(setPlaybackState(!jamState.isPlaying));
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      {/* Room Header */}
      <RoomHeader 
        roomName={roomName}
        roomCode={roomCode}
        participantCount={jamState.participants.length}
        bannerId={jamState.bannerId || 'library'}
        onLeaveRoom={onLeaveRoom}
        onShareRoom={handleCopyRoomCode}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column - Participants */}
        <div className="w-full md:w-64 bg-neutral-800 p-4 overflow-y-auto">
          <ParticipantsList 
            participants={jamState.participants}
            currentUserId={userId}
          />
        </div>
        
        {/* Center Column - Music Player and Visualization */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Music Player */}
          <div className="bg-neutral-800 p-4 border-b border-neutral-700">
            {jamState.currentTrack ? (
              <MusicPlayer 
                track={jamState.currentTrack}
                isPlaying={jamState.isPlaying}
                onPlayPause={handlePlayPause}
                volume={jamState.volume}
                onVolumeChange={handleVolumeChange}
                trackStartTime={jamState.trackStartTime}
              />
            ) : (
              <div className="text-center py-4 text-neutral-400">
                No music is currently playing
              </div>
            )}
          </div>
          
          {/* Music Visualization */}
          <div className="flex-1 bg-neutral-900 flex items-center justify-center p-4 overflow-hidden">
            <MusicVisualization isPlaying={jamState.isPlaying} />
          </div>
        </div>
        
        {/* Right Column - Chat */}
        <div className="w-full md:w-80 bg-neutral-800 flex flex-col overflow-hidden">
          <ChatArea 
            messages={jamState.messages}
            onSendMessage={handleSendMessage}
            currentUserId={userId}
          />
        </div>
      </div>
    </div>
  );
} 