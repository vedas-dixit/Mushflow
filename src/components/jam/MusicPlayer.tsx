"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX, Music, ChevronDown, ChevronUp } from 'lucide-react';
import { Track } from '@/redux/features/jamSlice';

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  trackStartTime?: string | null;
  availableTracks?: Track[];
  onChangeTrack?: (trackId: string) => void;
  isChangingTrack?: boolean;
}

export default function MusicPlayer({
  track,
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  trackStartTime,
  availableTracks = [],
  onChangeTrack,
  isChangingTrack = false
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  
  // Handle playback state changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    console.log('Playback state changed:', isPlaying ? 'Playing' : 'Paused');
    
    if (isPlaying) {
      // Use Promise to handle autoplay restrictions
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            // If autoplay is blocked, we need to handle it gracefully
            if (err.name === 'NotAllowedError') {
              console.log('Autoplay blocked by browser, waiting for user interaction');
            }
          });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);
  
  // Sync playback position when track or startTime changes
  useEffect(() => {
    if (!audioRef.current || !track) return;
    
    // When track changes, reset the audio source
    audioRef.current.src = track.url;
    
    // If we have a start time, sync the playback position
    if (trackStartTime) {
      const audio = audioRef.current;
      
      // Calculate how many seconds into the track we should be
      const serverStartTime = new Date(trackStartTime).getTime();
      const serverNow = Date.now();
      const elapsedSinceStart = (serverNow - serverStartTime) / 1000;
      
      console.log('Syncing playback:', {
        track: track.title,
        serverStartTime,
        serverNow,
        elapsedSinceStart,
        trackDuration: track.duration
      });
      
      // If the track should still be playing
      if (elapsedSinceStart < track.duration) {
        // Set the current time to the elapsed time
        audio.currentTime = elapsedSinceStart;
        
        // Play if isPlaying is true
        if (isPlaying) {
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Error playing audio after sync:', err);
              // If autoplay is blocked, we need to handle it gracefully
              if (err.name === 'NotAllowedError') {
                console.log('Autoplay blocked by browser, waiting for user interaction');
              }
            });
          }
        }
      } else {
        console.log('Track should have ended, resetting to beginning');
        audio.currentTime = 0;
        if (isPlaying) {
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              console.error('Error playing audio after reset:', err);
              // If autoplay is blocked, we need to handle it gracefully
              if (err.name === 'NotAllowedError') {
                console.log('Autoplay blocked by browser, waiting for user interaction');
              }
            });
          }
        }
      }
    }
  }, [track, trackStartTime, isPlaying]);
  
  // Add a listener for audio errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleError = (e: ErrorEvent) => {
      console.error('Audio error:', e);
    };
    
    audio.addEventListener('error', handleError as any);
    
    return () => {
      audio.removeEventListener('error', handleError as any);
    };
  }, []);
  
  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 50) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="relative">
      <audio ref={audioRef} src={track.url} />
      
      <div className="flex items-center">
        {/* Play/Pause Button */}
        <button 
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white mr-4 hover:bg-amber-600 transition-colors"
          disabled={isChangingTrack}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        {/* Track Info */}
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-medium text-white">{track.title}</h3>
          <p className="text-sm text-neutral-400">{track.artist}</p>
        </div>
        
        {/* Track Selector Button */}
        {onChangeTrack && availableTracks.length > 0 && (
          <button 
            onClick={() => setShowTrackSelector(!showTrackSelector)}
            className="mr-4 text-neutral-400 hover:text-white transition-colors"
            disabled={isChangingTrack}
          >
            <div className="flex items-center">
              <Music size={20} className="mr-1" />
              {showTrackSelector ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>
        )}
        
        {/* Volume Control */}
        <div className="flex items-center">
          <button className="text-neutral-400 mr-2">
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            className="w-24 accent-amber-500"
          />
        </div>
      </div>
      
      {/* Track Selector Dropdown */}
      {showTrackSelector && onChangeTrack && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-2">
            <h4 className="text-sm font-medium text-neutral-400 mb-2">Select a track</h4>
            <div className="space-y-1">
              {availableTracks.map(availableTrack => (
                <button
                  key={availableTrack.id}
                  onClick={() => {
                    onChangeTrack(availableTrack.id);
                    setShowTrackSelector(false);
                  }}
                  disabled={isChangingTrack}
                  className={`w-full text-left p-2 rounded hover:bg-neutral-700 transition-colors ${
                    availableTrack.id === track.id ? 'bg-neutral-700' : ''
                  }`}
                >
                  <div className="font-medium text-white">{availableTrack.title}</div>
                  <div className="text-sm text-neutral-400">{availableTrack.artist}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 