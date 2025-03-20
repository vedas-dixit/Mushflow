import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { setLoading } from './loaderSlice';

// Define types for our state
export interface Participant {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'USER_MESSAGE' | 'SYSTEM_MESSAGE';
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  attribution: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  bannerId: number;
  createdAt?: string;
  createdBy?: string;
  createdByName?: string;
  participantCount?: number;
}

export interface JamState {
  // Room state
  inRoom: boolean;
  roomId: string | null;
  roomCode: string | null;
  roomName: string | null;
  bannerId: number | null;
  
  // Music state
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  trackStartTime: string | any; //TODO:fix new (number)type here
  
  // Participants state
  participants: Participant[];
  
  // Chat state
  messages: Message[];
  
  // Available tracks
  availableTracks: Track[];
  
  // Available rooms
  availableRooms: Room[];
  
  // UI state
  isCreatingRoom: boolean;
  isJoiningRoom: boolean;
  isLoadingTracks: boolean;
  isLoadingRooms: boolean;
  isLoadingRoom: boolean;
  isSendingMessage: boolean;
  isChangingTrack: boolean;
  error: string | null;
  
  // RTM state
  rtmConnected: boolean;
  
  // New userName property
  userName: string;
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
  
  // Available tracks
  availableTracks: [],
  
  // Available rooms
  availableRooms: [],
  
  // UI state
  isCreatingRoom: false,
  isJoiningRoom: false,
  isLoadingTracks: false,
  isLoadingRooms: false,
  isLoadingRoom: false,
  isSendingMessage: false,
  isChangingTrack: false,
  error: null,
  
  // RTM state
  rtmConnected: false,
  
  // New userName property
  userName: '',
};

// Async thunks
export const fetchTracks = createAsyncThunk(
  'jam/fetchTracks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/jam/tracks');
      return response.data.tracks;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch tracks');
      }
      return rejectWithValue('Failed to fetch tracks');
    }
  }
);

export const fetchRooms = createAsyncThunk(
  'jam/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/jam/rooms');
      return response.data.rooms;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch rooms');
      }
      return rejectWithValue('Failed to fetch rooms');
    }
  }
);

export const createRoom = createAsyncThunk(
  'jam/createRoom',
  async (roomData: { name: string; bannerId?: number }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await axios.post('/api/jam/rooms', roomData);
      
      // Validate the response data
      const createdRoom = response.data.room;
      if (!createdRoom || !createdRoom.id) {
        return rejectWithValue('Invalid room data received from server');
      }
      
      return createdRoom;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to create room');
      }
      return rejectWithValue('Failed to create room');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const joinRoom = createAsyncThunk(
  'jam/joinRoom',
  async (roomCode: string, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await axios.post('/api/jam/rooms/join', { roomCode });
      
      // Validate the response data
      const roomData = response.data.room;
      if (!roomData || !roomData.id) {
        return rejectWithValue('Invalid room data received from server');
      }
      
      return roomData;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to join room');
      }
      return rejectWithValue('Failed to join room');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchRoomDetails = createAsyncThunk(
  'jam/fetchRoomDetails',
  async (roomId: string, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await axios.get(`/api/jam/rooms/${roomId}`);
      return response.data.room;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to fetch room details');
      }
      return rejectWithValue('Failed to fetch room details');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const leaveCurrentRoom = createAsyncThunk(
  'jam/leaveCurrentRoom',
  async (roomId: string, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await axios.post(`/api/jam/rooms/${roomId}/leave`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to leave room');
      }
      return rejectWithValue('Failed to leave room');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const sendMessage = createAsyncThunk(
  'jam/sendMessage',
  async ({ roomId, content }: { roomId: string; content: string }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await axios.post(`/api/jam/rooms/${roomId}/messages`, { content });
      return response.data.message;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to send message');
      }
      return rejectWithValue('Failed to send message');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const controlPlayback = createAsyncThunk(
  'jam/controlPlayback',
  async ({ 
    roomId, 
    action, 
    trackId 
  }: { 
    roomId: string; 
    action: 'PLAY' | 'PAUSE' | 'CHANGE_TRACK'; 
    trackId?: string 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/jam/rooms/${roomId}/playback`, { 
        action, 
        trackId 
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue(error.response.data.error || 'Failed to control playback');
      }
      return rejectWithValue('Failed to control playback');
    }
  }
);

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
      bannerId: number;
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
      startTime: string;
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
      const existingIndex = state.participants.findIndex(p => p.id === action.payload.id);
      if (existingIndex >= 0) {
        state.participants[existingIndex] = action.payload;
      } else {
        state.participants.push(action.payload);
      }
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
    
    // RTM actions
    updateParticipants: (state, action: PayloadAction<Participant[]>) => {
      state.participants = action.payload;
    },
    
    updatePlaybackState: (state, action: PayloadAction<{
      isPlaying: boolean;
      currentTrack: Track | null;
      trackStartTime: string | null;
    }>) => {
      state.isPlaying = action.payload.isPlaying;
      state.currentTrack = action.payload.currentTrack;
      state.trackStartTime = action.payload.trackStartTime;
    },
    
    setRTMConnected: (state, action: PayloadAction<boolean>) => {
      state.rtmConnected = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch tracks
    builder.addCase(fetchTracks.pending, (state) => {
      state.isLoadingTracks = true;
      state.error = null;
    });
    builder.addCase(fetchTracks.fulfilled, (state, action) => {
      state.isLoadingTracks = false;
      state.availableTracks = action.payload;
    });
    builder.addCase(fetchTracks.rejected, (state, action) => {
      state.isLoadingTracks = false;
      state.error = action.payload as string;
    });
    
    // Fetch rooms
    builder.addCase(fetchRooms.pending, (state) => {
      state.isLoadingRooms = true;
      state.error = null;
    });
    builder.addCase(fetchRooms.fulfilled, (state, action) => {
      state.isLoadingRooms = false;
      state.availableRooms = action.payload;
    });
    builder.addCase(fetchRooms.rejected, (state, action) => {
      state.isLoadingRooms = false;
      state.error = action.payload as string;
    });
    
    // Create room
    builder.addCase(createRoom.pending, (state) => {
      state.isCreatingRoom = true;
      state.error = null;
    });
    builder.addCase(createRoom.fulfilled, (state, action) => {
      state.isCreatingRoom = false;
      state.inRoom = true;
      state.roomId = action.payload.id;
      state.roomCode = action.payload.code;
      state.roomName = action.payload.name;
      state.bannerId = action.payload.bannerId;
    });
    builder.addCase(createRoom.rejected, (state, action) => {
      state.isCreatingRoom = false;
      state.error = action.payload as string;
    });
    
    // Join room
    builder.addCase(joinRoom.pending, (state) => {
      state.isJoiningRoom = true;
      state.error = null;
    });
    builder.addCase(joinRoom.fulfilled, (state, action) => {
      state.isJoiningRoom = false;
      state.inRoom = true;
      state.roomId = action.payload.id;
      state.roomCode = action.payload.code;
      state.roomName = action.payload.name;
      state.bannerId = action.payload.bannerId;
    });
    builder.addCase(joinRoom.rejected, (state, action) => {
      state.isJoiningRoom = false;
      state.error = action.payload as string;
    });
    
    // Fetch room details
    builder.addCase(fetchRoomDetails.pending, (state) => {
      state.isLoadingRoom = true;
      state.error = null;
    });
    builder.addCase(fetchRoomDetails.fulfilled, (state, action) => {
      state.isLoadingRoom = false;
      state.participants = action.payload.participants;
      state.messages = action.payload.messages;
      state.currentTrack = action.payload.currentTrack;
      state.isPlaying = action.payload.isPlaying;
      state.trackStartTime = action.payload.trackStartTime;
    });
    builder.addCase(fetchRoomDetails.rejected, (state, action) => {
      state.isLoadingRoom = false;
      state.error = action.payload as string;
    });
    
    // Leave room
    builder.addCase(leaveCurrentRoom.fulfilled, (state) => {
      state.inRoom = false;
      state.roomId = null;
      state.roomCode = null;
      state.roomName = null;
      state.bannerId = null;
      state.participants = [];
      state.messages = [];
      state.currentTrack = null;
      state.trackStartTime = null;
    });
    
    // Send message
    builder.addCase(sendMessage.pending, (state) => {
      state.isSendingMessage = true;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.isSendingMessage = false;
      state.messages.push(action.payload);
      
      // Limit message history to 100 messages
      if (state.messages.length > 100) {
        state.messages = state.messages.slice(-100);
      }
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.isSendingMessage = false;
      state.error = action.payload as string;
    });
    
    // Control playback
    builder.addCase(controlPlayback.pending, (state) => {
      state.isChangingTrack = true;
    });
    builder.addCase(controlPlayback.fulfilled, (state, action) => {
      state.isChangingTrack = false;
      state.isPlaying = action.payload.room.isPlaying;
      state.trackStartTime = action.payload.room.trackStartTime;
      
      if (action.payload.room.currentTrack) {
        state.currentTrack = action.payload.room.currentTrack;
      }
      
      if (action.payload.message) {
        state.messages.push(action.payload.message);
        
        // Limit message history to 100 messages
        if (state.messages.length > 100) {
          state.messages = state.messages.slice(-100);
        }
      }
    });
    builder.addCase(controlPlayback.rejected, (state, action) => {
      state.isChangingTrack = false;
      state.error = action.payload as string;
    });
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
  updateParticipants,
  updatePlaybackState,
  setRTMConnected,
} = jamSlice.actions;

// Export reducer
export default jamSlice.reducer; 