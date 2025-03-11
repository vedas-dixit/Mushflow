import { Track, Participant, Message } from './features/jamSlice';

// Mock track data
export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Peaceful Study',
    artist: 'Chillhop Music',
    url: '#',
    duration: 180,
    attribution: 'Music by Chillhop Music (https://chillhop.com)'
  },
  {
    id: '2',
    title: 'Focus Flow',
    artist: 'Ambient Waves',
    url: '#',
    duration: 240,
    attribution: 'Music by Ambient Waves'
  },
  {
    id: '3',
    title: 'Deep Concentration',
    artist: 'Study Beats',
    url: '#',
    duration: 210,
    attribution: 'Music by Study Beats'
  },
  {
    id: '4',
    title: 'Mindful Productivity',
    artist: 'Lo-Fi Collective',
    url: '#',
    duration: 195,
    attribution: 'Music by Lo-Fi Collective'
  }
];

// Mock participants data
export const mockParticipants: Participant[] = [
  { id: '1', name: 'Alex', isActive: true, joinedAt: Date.now() - 1000 * 60 * 5 },
  { id: '2', name: 'Taylor', isActive: true, joinedAt: Date.now() - 1000 * 60 * 3 },
  { id: '3', name: 'Jordan', isActive: true, joinedAt: Date.now() - 1000 * 60 * 2 },
  { id: '4', name: 'Sam', isActive: false, joinedAt: Date.now() - 1000 * 60 * 10 },
];

// Mock messages data
export const mockMessages: Message[] = [
  { id: '1', senderId: '1', senderName: 'Alex', content: 'Just joined the study session!', timestamp: Date.now() - 1000 * 60 * 4, type: 'text' },
  { id: '2', senderId: '2', senderName: 'Taylor', content: 'Working on calculus homework', timestamp: Date.now() - 1000 * 60 * 2, type: 'text' },
  { id: '3', senderId: 'system', senderName: 'System', content: 'Jordan joined the room', timestamp: Date.now() - 1000 * 60 * 1, type: 'join' },
];

// Function to initialize the store with mock data when a user joins a room
export const getMockRoomData = (userId: string, userName: string) => {
  // Add the current user to participants
  const currentUser: Participant = {
    id: userId,
    name: userName,
    isActive: true,
    joinedAt: Date.now()
  };
  
  const participants = [...mockParticipants, currentUser];
  
  // Add a system message for the current user joining
  const joinMessage: Message = {
    id: Date.now().toString(),
    senderId: 'system',
    senderName: 'System',
    content: `${userName} joined the room`,
    timestamp: Date.now(),
    type: 'join'
  };
  
  const messages = [...mockMessages, joinMessage];
  
  return {
    participants,
    messages,
    currentTrack: mockTracks[0],
    trackStartTime: Date.now() - 1000 * 30 // Started 30 seconds ago
  };
}; 