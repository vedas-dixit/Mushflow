"use client";

import React from 'react';
import AgoraTest from '@/components/AgoraTest';
import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="container mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agora RTM SDK Test Page</h1>
          <Link 
            href="/"
            className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-400 transition-colors"
          >
            Back to App
          </Link>
        </div>
        
        <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-neutral-700">
            <h2 className="text-lg font-semibold">RTM Connection Test</h2>
            <p className="text-neutral-300 text-sm">
              This page tests the Agora RTM SDK connection. It will attempt to connect to a test channel
              and send a message. Check the logs below for details.
            </p>
          </div>
          <div className="h-[calc(100vh-200px)]">
            <AgoraTest />
          </div>
        </div>
      </div>
    </div>
  );
} 