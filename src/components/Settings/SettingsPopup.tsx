"use client";

import React, { useState } from 'react';
import { ChevronDown, LogOut, Mail, Heart, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import ContactForm from './ContactForm';
import UserProfile from './UserProfile';
import VersionInfo from './VersionInfo';
import AboutSection from './AboutSection';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose }) => {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  
  if (!isOpen) return null;
  
  // Handle clicks on the overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if the click was directly on the overlay and not its children
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const openContactForm = () => {
    setIsContactFormOpen(true);
  };

  const closeContactForm = () => {
    setIsContactFormOpen(false);
  };

  const handleProfileUpdate = (data: { name?: string, about?: string }) => {
    console.log('Profile updated:', data);
    // In a real app, you would update the user profile in your backend
  };

  const handleViewChangelog = () => {
    // In a real app, you would show a changelog modal or redirect to a changelog page
    console.log('View changelog clicked');
  };
  
  return (
    <>
      <div 
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/50"
        onClick={handleOverlayClick}
      >
        <div className="relative w-full max-w-md bg-neutral-900 rounded-lg shadow-lg overflow-hidden mt-10">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-neutral-800">
            <div></div>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-6">
            {/* User Profile */}
            <UserProfile onUpdate={handleProfileUpdate} />
            
            
            
            {/* Version Info */}
            <VersionInfo 
              version="1.0.0" 
              buildDate={new Date().toLocaleDateString()} 
              onViewChangelog={handleViewChangelog} 
            />
            
            {/* Contact Support */}
            <div 
              className="bg-neutral-800 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-neutral-700 transition-colors"
              onClick={openContactForm}
            >
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-neutral-400" />
                <span className="text-white">Contact Support</span>
              </div>
              <ChevronDown size={16} className="text-neutral-400" />
            </div>
            
            {/* About Section */}
            <AboutSection />
          </div>
          {/* Logout Option */}
          <div className="mx-4 mb-2 bg-neutral-800 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-neutral-700 transition-colors" onClick={handleLogout}>
              <div className="flex items-center space-x-2">
                <LogOut size={16} className="text-red-500" />
                <span className="text-white">Logout</span>
              </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-neutral-800 flex justify-center items-center">
            <p className="text-neutral-400 text-sm flex items-center">
              Made with <Heart size={14} className="text-red-500 mx-1" /> by Vedas
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <ContactForm isOpen={isContactFormOpen} onClose={closeContactForm} />
    </>
  );
};

export default SettingsPopup; 