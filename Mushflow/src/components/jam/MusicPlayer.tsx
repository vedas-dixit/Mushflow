"use client";

import React, { useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Track } from '@/redux/features/jamSlice';

interface MusicPlayerProps {
  track: Track;
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  trackStartTime?: number | null;
}

export default function MusicPlayer({
  track,
  isPlaying,
  onPlayPause,
  volume,
  onVolumeChange,
  trackStartTime
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Handle playback state changes
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error('Error playing audio:', err));
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
    if (!audioRef.current || !trackStartTime) return;
    
    const audio = audioRef.current;
    
    // Calculate how many seconds into the track we should be
    const serverNow = Date.now();
    const elapsedSinceStart = (serverNow - trackStartTime) / 1000;
    
    // If the track should still be playing
    if (elapsedSinceStart < track.duration) {
      // Set the current time to the elapsed time
      audio.currentTime = elapsedSinceStart;
      
      // Play if isPlaying is true
      if (isPlaying) {
        audio.play().catch(err => console.error('Error playing audio:', err));
      }
    }
  }, [track, trackStartTime, isPlaying]);
  
  // Get volume icon based on level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} />;
    if (volume < 50) return <Volume1 size={20} />;
    return <Volume2 size={20} />;
  };

  return (
    <div className="flex items-center">
      <audio ref={audioRef} src={track.url} />
      
      {/* Play/Pause Button */}
      <button 
        onClick={onPlayPause}
        className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white mr-4 hover:bg-amber-600 transition-colors"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      {/* Track Info */}
      <div className="flex-1 mr-4">
        <h3 className="text-lg font-medium text-white">{track.title}</h3>
        <p className="text-sm text-neutral-400">{track.artist}</p>
      </div>
      
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
  );
} 