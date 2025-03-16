"use client";

import { useEffect } from 'react';

export default function AgoraScriptLoader() {
  useEffect(() => {
    // Check if the Agora RTM SDK is loaded
    if (typeof window !== 'undefined') {
      if (window.AgoraRTM) {
        console.log('Agora RTM SDK loaded from CDN');
        console.log('Agora RTM SDK global object available');
      } else {
        console.error('Agora RTM SDK global object not available');
        
        // Try to load it again if it's not available
        const script = document.createElement('script');
        script.src = 'https://download.agora.io/sdk/release/agora-rtm-2.2.1.js';
        script.async = true;
        script.onload = () => {
          console.log('Agora RTM SDK loaded dynamically');
          console.log('Agora RTM SDK global object:', window.AgoraRTM ? 'Available' : 'Not available');
        };
        script.onerror = () => {
          console.error('Failed to load Agora RTM SDK dynamically');
        };
        document.body.appendChild(script);
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
} 