"use client";

import React, { ReactNode } from 'react';
import ReduxProvider from "./ReduxProvider";
import AuthSyncProvider from './AuthSyncProvider';
import { RTMProvider } from './RTMProvider';
import AgoraScriptLoader from '@/components/AgoraScriptLoader';
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
            <AgoraScriptLoader />
            {children}
          </RTMProvider>
        </AuthSyncProvider>
      </ReduxProvider>
    </AuthProvider>
  );
} 