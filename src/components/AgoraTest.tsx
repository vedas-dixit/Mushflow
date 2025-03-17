"use client";

import React, { useEffect, useState } from 'react';
import AgoraRTM from 'agora-rtm-sdk';
import { useAppDispatch } from '@/redux/hooks';
import { setLoading } from '@/redux/features/loaderSlice';

export default function AgoraTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const dispatch = useAppDispatch();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, message]);
  };

  useEffect(() => {
    const testAgoraRTM = async () => {
      try {
        dispatch(setLoading(true));
        
        // Log Agora RTM SDK information
        addLog(`Agora RTM SDK loaded: ${!!AgoraRTM}`);
        addLog(`Agora RTM SDK methods: ${Object.keys(AgoraRTM).join(', ')}`);
        
        // Check if RTM constructor exists
        if (!AgoraRTM.RTM) {
          addLog('ERROR: AgoraRTM.RTM constructor not found');
          dispatch(setLoading(false));
          return;
        }
        
        addLog('RTM constructor found');
        
        // Initialize RTM client
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const userId = "test-user-" + Date.now();
        
        addLog(`Initializing RTM client with App ID: ${appId} and User ID: ${userId}`);
        
        // Extract RTM constructor
        const { RTM } = AgoraRTM;
        
        // Create RTM client
        const rtmClient = new RTM(appId ? appId : "", userId);
        addLog(`RTM client created: ${!!rtmClient}`);
        addLog(`RTM client methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(rtmClient)).join(', ')}`);
        
        // Set up event listeners
        rtmClient.addEventListener("status", (event: any) => {
          addLog(`RTM connection state changed: ${JSON.stringify(event)}`);
          if (event.state === 'CONNECTED') {
            setConnected(true);
          } else {
            setConnected(false);
          }
        });
        
        // Get a token
        addLog('Requesting RTM token...');
        const response = await fetch(`/api/jam/rtm/token?userId=${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          addLog(`ERROR: Failed to get token - ${data.error || 'Unknown error'}`);
          dispatch(setLoading(false));
          return;
        }
        
        addLog(`Token received: ${data.token.substring(0, 20)}...`);
        
        // Login to RTM
        addLog('Logging in to RTM...');
        try {
          const loginResult = await rtmClient.login({ token: data.token });
          addLog(`Login successful: ${JSON.stringify(loginResult)}`);
          
          // Subscribe to a test channel
          const channelName = "test-channel";
          addLog(`Subscribing to channel: ${channelName}`);
          
          const subscribeResult = await rtmClient.subscribe(channelName);
          addLog(`Channel subscription successful: ${JSON.stringify(subscribeResult)}`);
          
          // Send a test message
          const message = JSON.stringify({
            type: 'TEST',
            content: 'Hello from test component',
            timestamp: new Date().toISOString()
          });
          
          addLog(`Sending test message: ${message}`);
          await rtmClient.publish(channelName, message);
          addLog('Test message sent successfully');
          
          // Clean up after 10 seconds
          setTimeout(async () => {
            addLog('Cleaning up...');
            try {
              await rtmClient.unsubscribe(channelName);
              addLog('Unsubscribed from channel');
              
              await rtmClient.logout();
              addLog('Logged out from RTM');
            } catch (error) {
              addLog(`Error during cleanup: ${error instanceof Error ? error.message : String(error)}`);
            } finally {
              dispatch(setLoading(false));
            }
          }, 10000);
          
        } catch (error) {
          addLog(`Error during RTM operations: ${error instanceof Error ? error.message : String(error)}`);
          dispatch(setLoading(false));
        }
        
      } catch (error) {
        addLog(`Error: ${error instanceof Error ? error.message : String(error)}`);
        dispatch(setLoading(false));
      }
    };
    
    testAgoraRTM();
    
    return () => {
      // Ensure loader is turned off when component unmounts
      dispatch(setLoading(false));
    };
  }, [dispatch]);
  
  return (
    <div className="p-4 bg-neutral-900 text-white h-full overflow-auto">
      <h1 className="text-xl font-bold mb-4">Agora RTM Test</h1>
      <div className="mb-4">
        <span className="mr-2">Connection Status:</span>
        <span className={`px-2 py-1 rounded ${connected ? 'bg-green-500' : 'bg-red-500'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="border border-neutral-700 rounded p-4 bg-neutral-800">
        <h2 className="text-lg font-semibold mb-2">Logs:</h2>
        <div className="space-y-1 font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="border-b border-neutral-700 pb-1">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 