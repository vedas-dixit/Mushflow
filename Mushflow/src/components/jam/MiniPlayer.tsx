'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, X, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { JamState, setPlaybackState, setVolume, leaveRoom } from '@/redux/features/jamSlice';

export default function MiniPlayer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const jamState = useAppSelector(state => state.jam) as JamState;
  const { currentView } = useAppSelector(state => state.navigation);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Extract values from jamState safely
  const inRoom = jamState?.inRoom || false;
  const currentTrack = jamState?.currentTrack || null;
  const isPlaying = jamState?.isPlaying || false;
  const volume = jamState?.volume || 70;
  const roomName = jamState?.roomName || '';
  const trackStartTime = jamState?.trackStartTime || null;
  
  // Handle playback state changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack || !inRoom) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, inRoom]);
  
  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current || !inRoom) return;
    audioRef.current.volume = volume / 100;
  }, [volume, inRoom]);
  
  // Sync playback position when track or startTime changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack || !trackStartTime || !inRoom) return;
    
    const audio = audioRef.current;
    
    // Calculate how many seconds into the track we should be
    const serverNow = Date.now();
    const elapsedSinceStart = (serverNow - trackStartTime) / 1000;
    
    // If the track should still be playing
    if (elapsedSinceStart < currentTrack.duration) {
      // Set the current time to the elapsed time
      audio.currentTime = elapsedSinceStart;
      
      // Play if isPlaying is true
      if (isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      }
    }
  }, [currentTrack, trackStartTime, isPlaying, inRoom]);
  
  // Handle play/pause toggle
  const handlePlayPause = () => {
    dispatch(setPlaybackState(!isPlaying));
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVolume(parseInt(e.target.value)));
  };
  
  // Handle maximize (go to JAM page)
  const handleMaximize = () => {
    router.push('/jam');
  };
  
  // Handle close (leave room)
  const handleClose = () => {
    dispatch(leaveRoom());
  };
  
  // If not in a room, no track, or already on the JAM page, don't render anything
  if (!inRoom || !currentTrack || currentView === 'jam') {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-800 border-t border-neutral-700 p-3 flex items-center z-50">
      <audio ref={audioRef} src={currentTrack.url} />
      
      {/* Track Info */}
      <div className="flex-1 min-w-0 mr-4">
        <div className="truncate font-medium text-sm">{currentTrack.title}</div>
        <div className="truncate text-neutral-400 text-xs">
          {roomName} • {currentTrack.artist}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button 
          onClick={handlePlayPause}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-600 transition-colors"
        >
          {isPlaying ? (
            <Pause size={16} className="text-white" />
          ) : (
            <Play size={16} className="text-white" />
          )}
        </button>
        
        {/* Volume Control */}
        <div className="hidden sm:flex items-center gap-2">
          <Volume2 size={16} className="text-neutral-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-amber-500"
          />
        </div>
        
        {/* Maximize Button */}
        <button 
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-600 transition-colors"
        >
          <Maximize2 size={14} className="text-white" />
        </button>
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-700 hover:bg-neutral-600 transition-colors"
        >
          <X size={14} className="text-white" />
        </button>
      </div>
    </div>
  );
} 