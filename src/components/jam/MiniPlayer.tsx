'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, X, Maximize2, Music } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { JamState, setPlaybackState, setVolume, leaveRoom } from '@/redux/features/jamSlice';

interface NavigationState {
  currentView: string;
}

export default function MiniPlayer() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const jamState = useAppSelector(state => state.jam) as JamState;
  const { currentView } = useAppSelector(state => state.navigation) as NavigationState;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
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
    
    console.log('MiniPlayer - Playback state changed:', isPlaying ? 'Playing' : 'Paused');
    
    if (isPlaying) {
      audioRef.current.play()
        .catch(err => {
          console.error('MiniPlayer - Error playing audio:', err);
          // If autoplay is blocked, we need to handle it gracefully
          if (err.name === 'NotAllowedError') {
            console.log('MiniPlayer - Autoplay blocked by browser, waiting for user interaction');
          }
        });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack, inRoom]);
  
  // Add a listener for audio errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleError = (e: ErrorEvent) => {
      console.error('MiniPlayer - Audio error:', e);
    };
    
    audio.addEventListener('error', handleError as any);
    
    return () => {
      audio.removeEventListener('error', handleError as any);
    };
  }, []);
  
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
    const serverStartTime = new Date(trackStartTime).getTime();
    const serverNow = Date.now();
    const elapsedSinceStart = (serverNow - serverStartTime) / 1000;
    
    console.log('MiniPlayer - Syncing playback:', {
      track: currentTrack.title,
      serverStartTime,
      serverNow,
      elapsedSinceStart,
      trackDuration: currentTrack.duration
    });
    
    // If the track should still be playing
    if (elapsedSinceStart < currentTrack.duration) {
      // Set the current time to the elapsed time
      audio.currentTime = elapsedSinceStart;
      
      // Play if isPlaying is true
      if (isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      }
    } else {
      console.log('MiniPlayer - Track should have ended, resetting to beginning');
      audio.currentTime = 0;
      if (isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      }
    }
  }, [currentTrack, trackStartTime, isPlaying, inRoom]);
  
  // Handle play/pause toggle
  const handlePlayPause = () => {
    console.log('MiniPlayer - Toggle playback:', !isPlaying);
    dispatch(setPlaybackState(!isPlaying));
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setVolume(parseInt(e.target.value)));
  };
  
  
  // Handle close (leave room)
  const handleClose = () => {
    dispatch(leaveRoom());
  };
  
  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={16} />;
    if (volume < 50) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };
  
  // If not in a room, no track, or already on the JAM page, don't render anything
  if (!inRoom || !currentTrack || currentView === 'jam') {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-md border-t border-white/10 p-3 flex items-center z-40">
      <audio ref={audioRef} src={currentTrack.url} />
      
      {/* Album Art Placeholder */}
      <div className="w-10 h-10 rounded bg-gradient-to-br from-amber-500/20 to-amber-700/20 flex items-center justify-center mr-3 overflow-hidden">
        <Music size={16} className="text-amber-500/70" />
      </div>
      
      {/* Track Info */}
      <div className="flex-1 min-w-0 mr-4">
        <div className="truncate font-medium text-sm text-white">{currentTrack.title}</div>
        <div className="truncate text-white/60 text-xs">
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
            <Pause size={14} className="text-white" />
          ) : (
            <Play size={14} className="text-white ml-0.5" />
          )}
        </button>
        
        {/* Volume Control */}
        <div className="relative">
          <button 
            onClick={() => setShowVolumeControl(!showVolumeControl)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            {getVolumeIcon()}
          </button>
          
          {showVolumeControl && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-amber-500"
              />
            </div>
          )}
        </div>

        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
} 