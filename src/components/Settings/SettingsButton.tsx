"use client";

import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import SettingsPopup from './SettingsPopup';

const SettingsButton: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  
  return (
    <>
      <button
        onClick={openSettings}
        className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>
      
      <SettingsPopup isOpen={isSettingsOpen} onClose={closeSettings} />
    </>
  );
};

export default SettingsButton; 