"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setCreatingRoom, JamState } from '@/redux/features/jamSlice';

// Banner options
const bannerOptions = [
  { id: 'library', name: 'Cozy Library' },
  { id: 'rainy', name: 'Rainy Window' },
  { id: 'night', name: 'Night Desk' },
  { id: 'coffee', name: 'Coffee Shop' },
  { id: 'forest', name: 'Forest Cabin' },
  { id: 'urban', name: 'Urban Skyline' },
  { id: 'campus', name: 'Campus Study Hall' },
  { id: 'minimal', name: 'Minimal Workspace' },
];

interface CreateRoomModalProps {
  onClose: () => void;
  onRoomCreated: (roomId: string, roomCode: string, roomName: string, bannerId: string) => void;
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
    dispatch(setCreatingRoom(true));
    
    try {
      // This will be replaced with actual API call later
      // For now, just simulate a successful creation
      setTimeout(() => {
        // Generate a random 6-character room code
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const finalRoomName = getDisplayRoomName();
        
        onRoomCreated('mock-room-id', roomCode, finalRoomName, selectedBanner);
        dispatch(setCreatingRoom(false));
      }, 1000);
    } catch (error) {
      console.error('Error creating room:', error);
      dispatch(setCreatingRoom(false));
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
                    {banner.id === 'library' && '📚'}
                    {banner.id === 'rainy' && '🌧️'}
                    {banner.id === 'night' && '🌙'}
                    {banner.id === 'coffee' && '☕'}
                    {banner.id === 'forest' && '🌲'}
                    {banner.id === 'urban' && '🏙️'}
                    {banner.id === 'campus' && '🏛️'}
                    {banner.id === 'minimal' && '💻'}
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