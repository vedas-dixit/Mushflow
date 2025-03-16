import React from 'react';
import { User, Clock } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: string;
}

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId: string;
}

export default function ParticipantsList({
  participants,
  currentUserId
}: ParticipantsListProps) {
  // Format the time since joined
  const formatTimeSince = (joinedAt: string) => {
    const joinedTime = new Date(joinedAt).getTime();
    const now = Date.now();
    const diffInMinutes = Math.floor((now - joinedTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes === 1) return '1 minute ago';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return '1 hour ago';
    return `${diffInHours} hours ago`;
  };

  // Sort participants: you first, then active users, then inactive users
  const sortedParticipants = [...participants].sort((a, b) => {
    // Current user always first
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    
    // Then active users
    if (a.isActive && !b.isActive) return -1;
    if (!a.isActive && b.isActive) return 1;
    
    // Then by join time (most recent first)
    return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
  });

  return (
    <div>
      <h2 className="text-lg font-medium text-white mb-4">Participants ({participants.length})</h2>
      
      <div className="space-y-3">
        {sortedParticipants.length === 0 ? (
          <div className="text-neutral-400 text-center py-4">
            No participants yet
          </div>
        ) : (
          sortedParticipants.map(participant => (
            <div 
              key={participant.id}
              className="flex flex-col"
            >
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${participant.isActive ? 'bg-green-500' : 'bg-neutral-500'}`}></div>
                <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center mr-2">
                  <User size={16} className="text-neutral-400" />
                </div>
                <span className="text-white font-medium">
                  {participant.name}
                  {participant.id === currentUserId && ' (You)'}
                </span>
              </div>
              <div className="ml-12 text-xs text-neutral-400 flex items-center mt-1">
                <Clock size={12} className="mr-1" />
                {formatTimeSince(participant.joinedAt)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 