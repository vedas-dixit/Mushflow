"use client";

import React, { useState, useEffect } from 'react';
import { Music, Users, Code } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  setError, 
  JamState, 
  createRoom, 
  joinRoom, 
  fetchRooms 
} from '@/redux/features/jamSlice';

interface JamSelectionProps {
  onRoomCreated: (roomId: string, roomCode: string, roomName: string, bannerId: number) => void;
  onRoomJoined: (roomId: string, roomCode: string, roomName: string, bannerId: number) => void;
  userId: string;
  userName: string;
}

export default function JamSelection({ 
  onRoomCreated, 
  onRoomJoined,
  userId,
  userName
}: JamSelectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [roomName, setRoomName] = useState('');
  
  const dispatch = useAppDispatch();
  const jamState = useAppSelector(state => state.jam) as JamState;
  const { isJoiningRoom, isCreatingRoom, error, availableRooms } = jamState;

  // Fetch available rooms on component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Handle room creation
  const handleCreateRoom = async (modalRoomName?: string, modalBannerId?: number) => {
    const nameToUse = modalRoomName || roomName;
    const bannerToUse = modalBannerId || 1;
    
    if (!nameToUse.trim()) {
      dispatch(setError('Please enter a room name'));
      return;
    }
    
    try {
      const resultAction = await dispatch(createRoom({ name: nameToUse, bannerId: bannerToUse }));
      if (createRoom.fulfilled.match(resultAction)) {
        const room = resultAction.payload;
        console.log("Created room:", room);
        if (room && room.id) {
          onRoomCreated(room.id, room.code, room.name, room.bannerId);
        } else {
          console.error("Invalid room data received:", room);
          dispatch(setError('Failed to create room: Invalid response data'));
        }
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      dispatch(setError('Failed to create room'));
    }
  };

  // Handle room join
  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      dispatch(setError('Please enter a room code'));
      return;
    }

    try {
      const resultAction = await dispatch(joinRoom(joinCode.trim()));
      if (joinRoom.fulfilled.match(resultAction)) {
        const room = resultAction.payload;
        console.log("Joined room:", room);
        if (room && room.id) {
          onRoomJoined(room.id, room.code, room.name, room.bannerId);
        } else {
          console.error("Invalid room data received:", room);
          dispatch(setError('Failed to join room: Invalid response data'));
        }
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      dispatch(setError('Failed to join room: Room not found or invalid code'));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[94vh] p-4 relative bg-gradient-to-b from-black to-neutral-900 noise-bg ml-0 md:ml-11">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-700/20 p-4 rounded-full">
                <Music size={32} className="text-amber-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">Welcome to JAM Sessions</h1>
            <p className="text-white/60">
              Study together with synchronized music and chat
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-white/70 mb-2">
                Room Name
              </label>
              <input
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="My Awesome JAM Session"
              />
            </div>
            

            
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isCreatingRoom}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users size={18} className="mr-2" />
              {isCreatingRoom ? 'Creating...' : 'Create a New Room'}
            </button>
            <p className="text-xs text-center text-white/50 mt-1">Click to customize your room banner and settings</p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-black/40 text-white/60">or join with code</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter room code"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Code size={18} className="text-white/40" />
                  </div>
                </div>
                {error && (
                  <p className="mt-2 text-red-400 text-sm">{error}</p>
                )}
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={isJoiningRoom}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoiningRoom ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
          
          {availableRooms.length > 0 && (
            <div className="mt-8">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/40 text-white/60">Available Rooms</span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {availableRooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setJoinCode(room.code)}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-white">{room.name}</h3>
                        <p className="text-xs text-white/60">
                          {room.participantCount} {room.participantCount === 1 ? 'participant' : 'participants'}
                        </p>
                      </div>
                      <div className="bg-black/40 px-2 py-1 rounded text-xs font-mono text-amber-400">
                        {room.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={(modalRoomName, modalBannerId) => {
            handleCreateRoom(modalRoomName, modalBannerId);
            setShowCreateModal(false);
          }}
          userId={userId}
          userName={userName}
        />
      )}
    </div>
  );
} 