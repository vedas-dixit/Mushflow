"use client";

import React, { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Music, LogIn, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { hideLogin } from '@/redux/features/authSlice';

export default function LoginModal() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const { showLoginModal } = useAppSelector(state => state.auth);
  
  // Hide the modal when the user is authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      dispatch(hideLogin());
    }
  }, [status, dispatch]);
  
  // If the modal is not shown or the user is already authenticated, don't render anything
  if (!showLoginModal || status === 'authenticated') {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1"></div>
          <div className="flex justify-center flex-1">
            <div className="bg-amber-500/20 p-4 rounded-full">
              <Music size={32} className="text-amber-500" />
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            {/* Only show close button if we want to allow dismissal */}
            {/* <button className="text-neutral-400 hover:text-white">
              <X size={24} />
            </button> */}
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-white">Sign in Required</h1>
        <p className="text-neutral-400 mb-6">
          You need to sign in to access Mushflow features. Mushflow helps you stay productive with collaborative tools and focus features.
        </p>
        
        <button
          onClick={() => signIn('google')}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Sign In with Google
        </button>
        
        <p className="mt-4 text-neutral-500 text-sm">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
} 