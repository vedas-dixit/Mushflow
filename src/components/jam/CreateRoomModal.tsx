"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppSelector } from '@/redux/hooks';
import { JamState } from '@/redux/features/jamSlice';

// Banner options
const bannerOptions = [
  { id: 1, name: 'Cozy Library' },
  { id: 2, name: 'Rainy Window' },
  { id: 3, name: 'Night Desk' },
  { id: 4, name: 'Coffee Shop' },
  { id: 5, name: 'Forest Cabin' },
  { id: 6, name: 'Urban Skyline' },
  { id: 7, name: 'Campus Study Hall' },
  { id: 8, name: 'Minimal Workspace' },
];

interface CreateRoomModalProps {
  onClose: () => void;
  onRoomCreated: (roomName: string, bannerId: number) => void;
  userId: string;
  userName: string;
}

export default function CreateRoomModal({
  onClose,
  onRoomCreated,
}: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [selectedBanner, setSelectedBanner] = useState(bannerOptions[0].id);
  
  const jamState = useAppSelector(state => state.jam) as JamState;
  const { isCreatingRoom } = jamState;

  // Generate a random room name if none provided
  const getDisplayRoomName = () => {
    if (roomName.trim()) return roomName.trim();
    
    const adjectives = ['Focused', 'Productive', 'Creative', 'Calm', 'Peaceful'];
    const nouns = ['Study', 'Session', 'Space', 'Room', 'Zone'];
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdj} ${randomNoun}`;
  };

  // Handle room creation
  const handleCreateRoom = async () => {
    const finalRoomName = getDisplayRoomName();
    onRoomCreated(finalRoomName, selectedBanner);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/70 backdrop-blur-md rounded-xl shadow-xl border border-white/10 w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Create a New JAM Room</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-white/80 mb-2">
              Room Name (optional)
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name or leave blank for random name"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Select a Banner
            </label>
            <div className="grid grid-cols-4 gap-3">
              {bannerOptions.map((banner) => (
                <div 
                  key={banner.id}
                  onClick={() => setSelectedBanner(banner.id)}
                  className={`
                    aspect-video rounded-lg overflow-hidden cursor-pointer
                    ${selectedBanner === banner.id ? 'ring-2 ring-amber-500 scale-105' : 'hover:bg-white/10'}
                    transition-all duration-200
                  `}
                >
                  <img 
                    src={`/banners/${banner.id}.jpg`} 
                    alt={banner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRoom}
            disabled={isCreatingRoom}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreatingRoom ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
} 