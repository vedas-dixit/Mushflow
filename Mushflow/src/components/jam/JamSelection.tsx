"use client";

import React, { useState, useEffect } from 'react';
import { Music, Users, Code } from 'lucide-react';
import CreateRoomModal from './CreateRoomModal';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  setRoomData, 
  setJoiningRoom, 
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
  
  const dispatch = useAppDispatch();
  const jamState = useAppSelector(state => state.jam) as JamState;
  const { isJoiningRoom, isCreatingRoom, error, availableRooms } = jamState;

  // Fetch available rooms on component mount
  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  // Handle room creation
  const handleCreateRoom = async (roomName: string, bannerId: number) => {
    try {
      const resultAction = await dispatch(createRoom({ name: roomName, bannerId }));
      if (createRoom.fulfilled.match(resultAction)) {
        const room = resultAction.payload;
        console.log("Created room:", room);
        if (room && room.id) {
          onRoomCreated(room.id, room.code, room.name, room.bannerId);
          setShowCreateModal(false);
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
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="w-full max-w-md bg-neutral-800 rounded-xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-amber-500/20 p-4 rounded-full">
                <Music size={32} className="text-amber-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to JAM Sessions</h1>
            <p className="text-neutral-400">
              Study together with synchronized music and chat
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isCreatingRoom}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users size={18} className="mr-2" />
              {isCreatingRoom ? 'Creating...' : 'Create a New Room'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-neutral-800 text-neutral-400">or join with code</span>
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
                    className="w-full bg-neutral-700 border border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    maxLength={6}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Code size={18} className="text-neutral-400" />
                  </div>
                </div>
                {error && (
                  <p className="mt-2 text-red-500 text-sm">{error}</p>
                )}
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={isJoiningRoom}
                className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isJoiningRoom ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </div>
          
          {availableRooms.length > 0 && (
            <div className="mt-8">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-neutral-800 text-neutral-400">Available Rooms</span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {availableRooms.map(room => (
                  <div 
                    key={room.id}
                    onClick={() => setJoinCode(room.code)}
                    className="bg-neutral-700 hover:bg-neutral-600 rounded-lg p-3 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-white">{room.name}</h3>
                        <p className="text-xs text-neutral-400">
                          {room.participantCount} {room.participantCount === 1 ? 'participant' : 'participants'}
                        </p>
                      </div>
                      <div className="bg-neutral-800 px-2 py-1 rounded text-xs font-mono">
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
          onRoomCreated={handleCreateRoom}
          userId={userId}
          userName={userName}
        />
      )}
    </div>
  );
} 