import React from 'react';
import { ArrowLeft, Share2, Users } from 'lucide-react';

interface RoomHeaderProps {
  roomName: string;
  roomCode: string;
  participantCount: number;
  bannerId: number;
  onLeaveRoom: () => void;
  onShareRoom: () => void;
}

export default function RoomHeader({
  roomName,
  roomCode,
  participantCount,
  bannerId,
  onLeaveRoom,
  onShareRoom
}: RoomHeaderProps) {
  return (
    <div className="relative h-32 bg-gradient-to-r from-amber-900/30 to-neutral-900/30 overflow-hidden">
      {/* Banner Image (placeholder) */}
      <div className="absolute inset-0 opacity-30 bg-center bg-cover" 
           style={{ backgroundImage: `url(/banners/${bannerId}.jpg)` }}>
      </div>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-4">
        <div className="flex justify-between">
          <button 
            onClick={onLeaveRoom}
            className="flex items-center text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Leave Room</span>
          </button>
          
          <button 
            onClick={onShareRoom}
            className="flex items-center text-white/80 hover:text-white transition-colors"
          >
            <Share2 size={20} className="mr-1" />
            <span>Share Room</span>
          </button>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{roomName}</h1>
            <div className="flex items-center text-white/70 text-sm">
              <span className="mr-4">Room Code: {roomCode}</span>
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{participantCount} participants</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 