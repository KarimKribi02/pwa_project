'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ConnectivityToast from './ConnectivityToast';
import { autoPushPendingOrders } from '@/services/useCartSync';

interface ConnectivityContextType {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed';
  syncMessage: string;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: true,
  syncStatus: 'idle',
  syncMessage: '',
});

export const useConnectivity = () => useContext(ConnectivityContext);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'online' | 'offline' | 'syncing' | 'success' | 'failed'>('online');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    // Background Sync message listener from service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
        setSyncStatus('success');
        setSyncMessage(event.data.message);
        setToastType('success');
        setShowToast(true);
      }
    };

    const handleOnline = async () => {
      setIsOnline(true);
      setToastType('online');
      setShowToast(true);
      
      // Auto push pending orders when connection is restored
      try {
        await autoPushPendingOrders();
      } catch (err) {
        console.error("Auto push failed on reconnect:", err);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setToastType('offline');
      setShowToast(true);
    };

    const handleSyncStatus = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { status, message } = customEvent.detail;
      setSyncStatus(status);
      setSyncMessage(message || '');
      
      if (status !== 'idle') {
        setToastType(status);
        setShowToast(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('menuiserie-sync-status', handleSyncStatus);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('menuiserie-sync-status', handleSyncStatus);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  return (
    <ConnectivityContext.Provider value={{ isOnline, syncStatus, syncMessage }}>
      {children}
      <AnimatePresence>
        {showToast && (
          <ConnectivityToast 
            type={toastType} 
            message={syncMessage} 
            onClose={() => setShowToast(false)} 
          />
        )}
      </AnimatePresence>
    </ConnectivityContext.Provider>
  );
};
