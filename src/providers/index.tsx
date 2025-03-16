"use client";

import React, { ReactNode } from 'react';
import ReduxProvider from "./ReduxProvider";
import AuthSyncProvider from './AuthSyncProvider';
import { RTMProvider } from './RTMProvider';

import AuthProvider from './AuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ReduxProvider>
        <AuthSyncProvider>
          <RTMProvider>
            
            {children}
          </RTMProvider>
        </AuthSyncProvider>
      </ReduxProvider>
    </AuthProvider>
  );
} 