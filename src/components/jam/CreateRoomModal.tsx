"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCreatingRoom, JamState } from '@/redux/features/jamSlice';

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
  userId,
  userName
}: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [selectedBanner, setSelectedBanner] = useState(bannerOptions[0].id);
  
  const dispatch = useAppDispatch();
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

  // Get emoji for banner ID
  const getBannerEmoji = (bannerId: number) => {
    switch (bannerId) {
      case 1: return '📚'; // Library
      case 2: return '🌧️'; // Rainy
      case 3: return '🌙'; // Night
      case 4: return '☕'; // Coffee
      case 5: return '🌲'; // Forest
      case 6: return '🏙️'; // Urban
      case 7: return '🏛️'; // Campus
      case 8: return '💻'; // Minimal
      default: return '📚';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-neutral-700">
          <h2 className="text-xl font-bold">Create a New JAM Room</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-neutral-300 mb-2">
              Room Name (optional)
            </label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name or leave blank for random name"
              className="w-full bg-neutral-700 border border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Select a Banner
            </label>
            <div className="grid grid-cols-4 gap-3">
              {bannerOptions.map((banner) => (
                <div 
                  key={banner.id}
                  onClick={() => setSelectedBanner(banner.id)}
                  className={`
                    aspect-video bg-neutral-700 rounded-lg overflow-hidden cursor-pointer
                    ${selectedBanner === banner.id ? 'ring-2 ring-amber-500' : 'hover:opacity-80'}
                    transition-all duration-200
                  `}
                >
                  <div className="h-full flex items-center justify-center text-2xl">
                    {getBannerEmoji(banner.id)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
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