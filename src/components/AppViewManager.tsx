"use client";

import React from 'react';
import { useAppSelector } from '@/redux/hooks';
import JamPage from './jam/JamPage';
import { DynamicHeader } from './Header/header';

interface AppViewManagerProps {
  children: React.ReactNode;
}

export default function AppViewManager({ children }: AppViewManagerProps) {
  const { currentView } = useAppSelector(state => state.navigation);
  const { status } = useAppSelector(state => state.auth);
  
  // If the user is not authenticated, just render the children (which will show the login modal)
  if (status !== 'authenticated') {
    return <>{children}</>;
  }
  
  // Render the appropriate view based on the current view in Redux
  switch (currentView) {
    case 'jam':
      return <>
      <DynamicHeader/>
      <JamPage />
      </>;
    case 'notes':
    default:
      // For notes and other views, render the children (main app content)
      return <>{children}</>;
  }
} 