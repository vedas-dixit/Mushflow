import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
export interface Participant {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  type: 'text' | 'system' | 'join' | 'leave';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  attribution: string;
}

export interface JamState {
  // Room state
  inRoom: boolean;
  roomId: string | null;
  roomCode: string | null;
  roomName: string | null;
  bannerId: string | null;
  
  // Music state
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  trackStartTime: number | null;
  
  // Participants state
  participants: Participant[];
  
  // Chat state
  messages: Message[];
  
  // UI state
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  error: string | null;
}

// Define the initial state
const initialState: JamState = {
  // Room state
  inRoom: false,
  roomId: null,
  roomCode: null,
  roomName: null,
  bannerId: null,
  
  // Music state
  currentTrack: null,
  isPlaying: false,
  volume: 70, // Default volume (0-100)
  trackStartTime: null,
  
  // Participants state
  participants: [],
  
  // Chat state
  messages: [],
  
  // UI state
  isCreatingRoom: false,
  isJoiningRoom: false,
  error: null,
};

// Create the slice
export const jamSlice = createSlice({
  name: 'jam',
  initialState,
  reducers: {
    // Room actions
    setRoomData: (state, action: PayloadAction<{
      roomId: string;
      roomCode: string;
      roomName: string;
      bannerId: string;
    }>) => {
      state.inRoom = true;
      state.roomId = action.payload.roomId;
      state.roomCode = action.payload.roomCode;
      state.roomName = action.payload.roomName;
      state.bannerId = action.payload.bannerId;
    },
    
    leaveRoom: (state) => {
      state.inRoom = false;
      state.roomId = null;
      state.roomCode = null;
      state.roomName = null;
      state.bannerId = null;
      state.participants = [];
      state.messages = [];
      state.currentTrack = null;
      state.trackStartTime = null;
    },
    
    // Music actions
    setCurrentTrack: (state, action: PayloadAction<{
      track: Track;
      startTime: number;
    }>) => {
      state.currentTrack = action.payload.track;
      state.trackStartTime = action.payload.startTime;
      state.isPlaying = true;
    },
    
    setPlaybackState: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    
    // Participants actions
    setParticipants: (state, action: PayloadAction<Participant[]>) => {
      state.participants = action.payload;
    },
    
    addParticipant: (state, action: PayloadAction<Participant>) => {
      state.participants.push(action.payload);
    },
    
    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },
    
    updateParticipantStatus: (state, action: PayloadAction<{
      id: string;
      isActive: boolean;
    }>) => {
      const participant = state.participants.find(p => p.id === action.payload.id);
      if (participant) {
        participant.isActive = action.payload.isActive;
      }
    },
    
    // Chat actions
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      
      // Limit message history to 100 messages
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(-100);
      }
    },
    
    // UI actions
    setCreatingRoom: (state, action: PayloadAction<boolean>) => {
      state.isCreatingRoom = action.payload;
    },
    
    setJoiningRoom: (state, action: PayloadAction<boolean>) => {
      state.isJoiningRoom = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Export actions
export const {
  setRoomData,
  leaveRoom,
  setCurrentTrack,
  setPlaybackState,
  setVolume,
  setParticipants,
  addParticipant,
  removeParticipant,
  updateParticipantStatus,
  addMessage,
  setCreatingRoom,
  setJoiningRoom,
  setError,
} = jamSlice.actions;

// Export reducer
export default jamSlice.reducer; 