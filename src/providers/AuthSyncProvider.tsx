"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAppDispatch } from '@/redux/hooks';
import { setUser, setStatus } from '@/redux/features/authSlice';

export default function AuthSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  
  // Sync NextAuth session with Redux store
  useEffect(() => {
    // Update status
    dispatch(setStatus(status as 'loading' | 'authenticated' | 'unauthenticated'));
    
    // Update user
    if (session?.user) {
      dispatch(setUser({
        id: session.user.id || 'anonymous',
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
      }));
    } else if (status === 'unauthenticated') {
      dispatch(setUser(null));
    }
  }, [session, status, dispatch]);
  
  return <>{children}</>;
} 