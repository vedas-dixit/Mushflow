"use client";

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import SettingsPopup from './SettingsPopup';

interface SettingsButtonProps {
  className?: string;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ className }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  
  // Check if this is in the sidebar
  const isSidebar = className?.includes('w-full');
  
  return (
    <>
      <button
        onClick={openSettings}
        className={className || 'p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors'}
        aria-label="Settings"
      >
        <Settings size={20} className="w-5 h-5 min-w-[20px]" />
        {isSidebar && (
          <span className="ml-4 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Settings
          </span>
        )}
      </button>
      
      <SettingsPopup isOpen={isSettingsOpen} onClose={closeSettings} />
    </>
  );
};

export default SettingsButton; 