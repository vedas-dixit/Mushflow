"use client";

import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import should be inside a client component
const ClientSideProviders = dynamic(() => import('@/components/ClientSideProviders'), { 
  ssr: false 
});

interface LayoutClientWrapperProps {
  children: ReactNode;
}

export default function LayoutClientWrapper({ children }: LayoutClientWrapperProps) {
  return (
    <ClientSideProviders>
      {children}
    </ClientSideProviders>
  );
} 