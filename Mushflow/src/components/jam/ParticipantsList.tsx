import React from 'react';
import { User } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isActive: boolean;
  joinedAt: number;
}

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId: string;
}

export default function ParticipantsList({
  participants,
  currentUserId
}: ParticipantsListProps) {
  return (
    <div>
      <h2 className="text-lg font-medium text-white mb-4">Participants</h2>
      
      <div className="space-y-3">
        {participants.map(participant => (
          <div 
            key={participant.id}
            className="flex items-center"
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${participant.isActive ? 'bg-green-500' : 'bg-neutral-500'}`}></div>
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center mr-2">
              <User size={16} className="text-neutral-400" />
            </div>
            <span className="text-white">
              {participant.name}
              {participant.id === currentUserId && ' (You)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 