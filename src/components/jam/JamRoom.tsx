"use client";

import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import {  
  JamState, 
  sendMessage, 
  setVolume, 
  controlPlayback, 
  fetchRoomDetails 
} from '@/redux/features/jamSlice';
import { useRTM } from '@/providers/RTMProvider';
import { ArrowLeft, Share2, Users, ChevronRight, ChevronLeft, X, Volume2, Volume1, VolumeX, Music, ChevronDown, ChevronUp, Play, Pause, SkipForward, Send, Clock } from 'lucide-react';

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
  
  // UI state
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
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
  }, [jamState.participants]);
  
  // Handle audio playback
  useEffect(() => {
    if (!audioRef.current || !jamState.currentTrack) return;
    
    if (jamState.isPlaying) {
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Error playing audio:', err);
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [jamState.isPlaying, jamState.currentTrack]);
  
  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = jamState.volume / 100;
  }, [jamState.volume]);
  
  // Sync playback position when track or startTime changes
  useEffect(() => {
    if (!audioRef.current || !jamState.currentTrack || !jamState.trackStartTime) return;
    
    const audio = audioRef.current;
    
    // Calculate how many seconds into the track we should be
    const serverStartTime = new Date(jamState.trackStartTime).getTime();
    const serverNow = Date.now();
    const elapsedSinceStart = (serverNow - serverStartTime) / 1000;
    
    // If the track should still be playing
    if (elapsedSinceStart < jamState.currentTrack.duration) {
      // Set the current time to the elapsed time
      audio.currentTime = elapsedSinceStart;
      
      // Play if isPlaying is true
      if (jamState.isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      }
    } else {
      audio.currentTime = 0;
      if (jamState.isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      }
    }
  }, [jamState.currentTrack, jamState.trackStartTime, jamState.isPlaying]);
  
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
      console.log('Toggling playback state:', jamState.isPlaying ? 'PAUSE' : 'PLAY');
      
      // Send playback command via RTM
      const rtmSuccess = await rtm.sendPlaybackCommand(
        jamState.isPlaying ? 'PAUSE' : 'PLAY'
      );
      
      // If RTM fails, fall back to API
      if (!rtmSuccess) {
        console.log('RTM failed, falling back to API');
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
      
      // Send track change command via RTM
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
      
      setShowTrackSelector(false);
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
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (jamState.volume === 0) return <VolumeX size={18} />;
    if (jamState.volume < 50) return <Volume1 size={18} />;
    return <Volume2 size={18} />;
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Audio Element */}
      {jamState.currentTrack && (
        <audio ref={audioRef} src={jamState.currentTrack.url} />
      )}
      
      {/* Full-screen Banner Background */}
      <div 
        className="absolute inset-0 bg-center bg-cover" 
        style={{ 
          backgroundImage: `url(/banners/${jamState.bannerId || 1}.jpg)`,
          filter: 'brightness(0.3) saturate(1.2)'
        }}
      />
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
      
      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center">
          <button 
            onClick={onLeaveRoom}
            className="flex items-center text-white/80 hover:text-white transition-colors bg-black/30 rounded-full px-4 py-2"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span>Leave Room</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{roomName}</h1>
            <div className="flex items-center justify-center text-white/70 text-sm mt-1">
              <span className="mr-4">Room Code: {roomCode}</span>
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{jamState.participants.length} participants</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleCopyRoomCode}
            className="flex items-center text-white/80 hover:text-white transition-colors bg-black/30 rounded-full px-4 py-2"
          >
            <Share2 size={18} className="mr-2" />
            <span>Share Room</span>
          </button>
        </div>
        
        {/* Main Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Music Player - Centered in the screen */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {jamState.currentTrack ? (
              <div className="w-full max-w-2xl p-6 rounded-xl bg-black/40 backdrop-blur-md pointer-events-auto">
                <div className="flex flex-col items-center">
                  {/* Album Art Placeholder */}
                  <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-700/20 flex items-center justify-center mb-6 overflow-hidden">
                    <Music size={64} className="text-amber-500/50" />
                  </div>
                  
                  {/* Track Info */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-white mb-1">{jamState.currentTrack.title}</h3>
                    <p className="text-white/70">{jamState.currentTrack.artist}</p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center space-x-6">
                    {/* Track Selector */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowTrackSelector(!showTrackSelector)}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        disabled={jamState.isChangingTrack}
                      >
                        <Music size={18} />
                      </button>
                      
                      {/* Track Selector Dropdown */}
                      {showTrackSelector && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 w-64 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          <div className="p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium text-white/90">Select a track</h4>
                              <button 
                                onClick={() => setShowTrackSelector(false)}
                                className="text-white/70 hover:text-white"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="space-y-1">
                              {jamState.availableTracks.map(availableTrack => (
                                <button
                                  key={availableTrack.id}
                                  onClick={() => handleChangeTrack(availableTrack.id)}
                                  disabled={jamState.isChangingTrack}
                                  className={`w-full text-left p-2 rounded hover:bg-white/10 transition-colors ${
                                    availableTrack.id === jamState.currentTrack?.id ? 'bg-white/10' : ''
                                  }`}
                                >
                                  <div className="font-medium text-white">{availableTrack.title}</div>
                                  <div className="text-xs text-white/70">{availableTrack.artist}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Play/Pause Button */}
                    <button 
                      onClick={handlePlayPause}
                      className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white hover:bg-amber-600 transition-colors"
                      disabled={jamState.isChangingTrack}
                    >
                      {jamState.isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                    </button>
                    
                    {/* Volume Control */}
                    <div className="relative group">
                      <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        {getVolumeIcon()}
                      </button>
                      
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-opacity duration-200">
                        <div className="bg-black/80 backdrop-blur-md rounded-lg p-2 h-32 flex flex-col items-center">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={jamState.volume}
                            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                            className="h-24 w-2 accent-amber-500 appearance-none bg-white/20 rounded-full"
                            style={{ 
                              WebkitAppearance: 'slider-vertical', /* WebKit */
                            }}
                          />
                          <span className="text-xs text-white/70 mt-1">{jamState.volume}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-black/40 backdrop-blur-md rounded-xl pointer-events-auto">
                <Music size={48} className="text-white/30 mx-auto mb-4" />
                <p className="text-white/70 text-lg">No music is currently playing</p>
                {jamState.availableTracks.length > 0 && (
                  <button
                    onClick={() => setShowTrackSelector(true)}
                    className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    Select a track
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Chat Panel - Fixed to right side */}
          <div className={`fixed top-0 right-0 h-full transition-all duration-300 ease-in-out z-20 ${showChat ? 'w-80' : 'w-0'}`}>
            {showChat && (
              <div className="h-full flex flex-col bg-black/50 backdrop-blur-md">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                  <h2 className="text-lg font-medium text-white">Chat</h2>
                  <button 
                    onClick={() => setShowChat(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                {/* Messages - Fixed height to ensure message input is visible */}
                <div className="flex-1 p-4 overflow-y-auto" style={{ height: 'calc(100vh - 130px)' }}>
                  <div className="space-y-3">
                    {jamState.messages.map(message => (
                      <div 
                        key={message.id}
                        className={`
                          ${message.type === 'SYSTEM_MESSAGE' ? 'text-white/50 text-sm italic text-center py-1' : ''}
                        `}
                      >
                        {message.type === 'USER_MESSAGE' && (
                          <div className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                            <div 
                              className={`
                                max-w-[85%] rounded-lg px-3 py-2
                                ${message.senderId === userId 
                                  ? 'bg-amber-500/90 text-white' 
                                  : 'bg-white/10 text-white'}
                              `}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">
                                  {message.senderId === userId ? 'You' : message.senderName}
                                </span>
                                <span className="text-xs opacity-70 ml-2">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <p className="break-words">{message.content}</p>
                            </div>
                          </div>
                        )}
                        
                        {message.type === 'SYSTEM_MESSAGE' && (
                          <div className="text-center py-1">
                            {message.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message Input - Fixed to bottom */}
                <div className="p-3 border-t border-white/10 bg-black/50">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.elements.namedItem('messageInput') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        handleSendMessage(input.value);
                        input.value = '';
                      }
                    }}
                    className="flex"
                  >
                    <input
                      type="text"
                      name="messageInput"
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 border border-white/10 rounded-l-lg py-2 px-3 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-transparent"
                      disabled={jamState.isSendingMessage}
                    />
                    <button
                      type="submit"
                      disabled={jamState.isSendingMessage}
                      className="bg-amber-500 hover:bg-amber-600 text-white rounded-r-lg px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          
          {/* Collapsed Chat Toggle */}
          {!showChat && (
            <button 
              onClick={() => setShowChat(true)}
              className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-black/50 text-white/70 hover:text-white p-2 rounded-l-lg z-20"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          
          {/* Participants Panel - Fixed to bottom */}
          <div className={`fixed bottom-0 left-0 right-0 transition-all duration-300 ease-in-out z-20 ${showParticipants ? 'h-64' : 'h-0'}`}>
            {showParticipants && (
              <div className="h-full flex flex-col bg-black/50 backdrop-blur-md">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                  <h2 className="text-lg font-medium text-white">Participants ({jamState.participants.length})</h2>
                  <button 
                    onClick={() => setShowParticipants(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {jamState.participants.length === 0 ? (
                      <div className="text-white/50 text-center py-4 col-span-full">
                        No participants yet
                      </div>
                    ) : (
                      jamState.participants.map(participant => (
                        <div 
                          key={participant.id}
                          className="flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full mr-3 ${participant.isActive ? 'bg-green-500' : 'bg-neutral-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white truncate">
                              {participant.name}
                              {participant.id === userId && ' (You)'}
                            </div>
                            <div className="text-xs text-white/50 flex items-center mt-1">
                              <Clock size={12} className="mr-1" />
                              Joined {formatTime(participant.joinedAt)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Collapsed Participants Toggle */}
          {!showParticipants && (
            <button 
              onClick={() => setShowParticipants(true)}
              className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-black/50 text-white/70 hover:text-white p-2 px-4 rounded-t-lg z-20"
            >
              <div className="flex items-center">
                <Users size={16} className="mr-2" />
                <span>Show Participants ({jamState.participants.length})</span>
                <ChevronUp size={16} className="ml-2" />
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 