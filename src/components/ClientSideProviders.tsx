"use client";

import React, { ReactNode } from 'react';
import { HeaderProvider } from "@/components/Header/header";
import MiniPlayer from "@/components/jam/MiniPlayer";
import LoginModal from "@/components/auth/LoginModal";
import AppViewManager from "@/components/AppViewManager";
import { Providers } from "@/providers";
import Loader from "@/components/loader/Loader";

interface ClientSideProvidersProps {
  children: ReactNode;
}

export default function ClientSideProviders({ children }: ClientSideProvidersProps) {
  return (
    <Providers>
      <HeaderProvider>
        <AppViewManager>
          {children}
        </AppViewManager>
        <MiniPlayer />
        <LoginModal />
        <Loader />
      </HeaderProvider>
    </Providers>
  );
} 