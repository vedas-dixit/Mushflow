"use client";

import React, { useEffect } from 'react';
import RoomHeader from './RoomHeader';
import MusicPlayer from './MusicPlayer';
import MusicVisualization from './MusicVisualization';
import ParticipantsList from './ParticipantsList';
import ChatArea from './ChatArea';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { 
  JamState, 
  sendMessage, 
  setVolume, 
  controlPlayback, 
  fetchRoomDetails 
} from '@/redux/features/jamSlice';
import { useRTM } from '@/providers/RTMProvider';

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
  const rtm = useRTM();
  
  // Periodically refresh room data as a fallback
  useEffect(() => {
    // Set up a less frequent polling as a fallback
    // This is just in case RTM has issues
    const intervalId = setInterval(() => {
      if (!jamState.rtmConnected) {
        console.log("RTM not connected, falling back to polling");
        dispatch(fetchRoomDetails(roomId));
      }
    }, 30000); // Every 30 seconds as a fallback
    
    return () => clearInterval(intervalId);
  }, [roomId, dispatch, jamState.rtmConnected]);
  
  // Debug log for participant changes
  useEffect(() => {
    console.log("Participants updated:", jamState.participants);
    console.log("Participant details:", jamState.participants.map(p => ({
      id: p.id,
      name: p.name,
      isActive: p.isActive,
      joinedAt: p.joinedAt
    })));
    console.log("Total participants:", jamState.participants.length);
  }, [jamState.participants]);
  
  // Handle sending a new message
  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    try {
      // Send message via RTM
      const rtmSuccess = await rtm.sendChannelMessage(content.trim(), 'USER_MESSAGE');
      
      // If RTM fails, fall back to API
      if (!rtmSuccess) {
        await dispatch(sendMessage({ roomId, content: content.trim() }));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fall back to API
      await dispatch(sendMessage({ roomId, content: content.trim() }));
    }
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
  const handlePlayPause = async () => {
    try {
      // Send playback command via RTM
      const rtmSuccess = await rtm.sendPlaybackCommand(
        jamState.isPlaying ? 'PAUSE' : 'PLAY'
      );
      
      // If RTM fails, fall back to API
      if (!rtmSuccess) {
        await dispatch(controlPlayback({
          roomId,
          action: jamState.isPlaying ? 'PAUSE' : 'PLAY'
        }));
      }
    } catch (error) {
      console.error('Failed to control playback:', error);
      // Fall back to API
      await dispatch(controlPlayback({
        roomId,
        action: jamState.isPlaying ? 'PAUSE' : 'PLAY'
      }));
    }
  };
  
  // Handle track change
  const handleChangeTrack = async (trackId: string) => {
    try {
      console.log('Changing track to:', trackId);
      
      // Find the track in available tracks
      const track = jamState.availableTracks.find(t => t.id === trackId);
      if (!track) {
        console.error('Track not found:', trackId);
        return;
      }
      
      console.log('Found track:', track.title, 'by', track.artist);
      
      // Send track change command via RTM
      console.log('Sending track change via RTM...');
      const rtmSuccess = await rtm.sendPlaybackCommand('CHANGE_TRACK', trackId);
      
      // If RTM fails, fall back to API
      if (!rtmSuccess) {
        console.log('RTM failed, falling back to API');
        await dispatch(controlPlayback({
          roomId,
          action: 'CHANGE_TRACK',
          trackId
        }));
      }
    } catch (error) {
      console.error('Failed to change track:', error);
      // Fall back to API
      await dispatch(controlPlayback({
        roomId,
        action: 'CHANGE_TRACK',
        trackId
      }));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-900">
      {/* Room Header */}
      <RoomHeader 
        roomName={roomName}
        roomCode={roomCode}
        participantCount={jamState.participants.length}
        bannerId={jamState.bannerId || 1}
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
                availableTracks={jamState.availableTracks}
                onChangeTrack={handleChangeTrack}
                isChangingTrack={jamState.isChangingTrack}
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
            isSending={jamState.isSendingMessage}
          />
        </div>
      </div>
    </div>
  );
} 