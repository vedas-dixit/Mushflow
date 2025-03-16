"use client";

import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface UserProfileProps {
  onUpdate?: (data: { name?: string, about?: string }) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onUpdate }) => {
  const { data: session } = useSession();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [name, setName] = useState(session?.user?.name || 'User');
  const [about, setAbout] = useState('Music lover and collaborative study enthusiast');
  
  const handleNameSave = () => {
    setIsEditingName(false);
    if (onUpdate) {
      onUpdate({ name });
    }
  };
  
  const handleAboutSave = () => {
    setIsEditingAbout(false);
    if (onUpdate) {
      onUpdate({ about });
    }
  };
  
  const cancelNameEdit = () => {
    setName(session?.user?.name || 'User');
    setIsEditingName(false);
  };
  
  const cancelAboutEdit = () => {
    setAbout('Music lover and collaborative study enthusiast');
    setIsEditingAbout(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Profile Image and Name */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800">
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt="Profile" 
                width={96} 
                height={96} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <span className="text-2xl">{name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-white text-lg font-medium">{name}</h3>
          {session?.user?.email && (
            <p className="text-neutral-400 text-sm">{session.user.email}</p>
          )}
        </div>
      </div>
      
      {/* Display Name */}
      
      
      {/* About Section */}
  
    </div>
  );
};

export default UserProfile; 