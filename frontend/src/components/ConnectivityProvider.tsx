'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ConnectivityToast from './ConnectivityToast';
import { autoPushPendingOrders } from '@/services/useCartSync';
import { syncCatalog, type CatalogSyncStatus } from '@/services/catalogSync';

interface ConnectivityContextType {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed';
  syncMessage: string;
  catalogSyncStatus: CatalogSyncStatus;
  pendingOrdersCount: number;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isOnline: true,
  syncStatus: 'idle',
  syncMessage: '',
  catalogSyncStatus: 'idle',
  pendingOrdersCount: 0,
});

export const useConnectivity = () => useContext(ConnectivityContext);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'failed'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [catalogSyncStatus, setCatalogSyncStatus] = useState<CatalogSyncStatus>('idle');
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'online' | 'offline' | 'syncing' | 'success' | 'failed'>('online');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const refreshPendingCount = async () => {
      const { db } = await import('@/services/db');
      const count = await db.pendingOrders
        .where('status')
        .anyOf(['pending', 'failed'])
        .count();
      setPendingOrdersCount(count);
    };

    refreshPendingCount();

    if (navigator.onLine) {
      syncCatalog().catch(() => undefined);
      autoPushPendingOrders({ silent: true })
        .then(refreshPendingCount)
        .catch(console.error);
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'BACKGROUND_SYNC_COMPLETE') {
        setSyncStatus('success');
        setSyncMessage(event.data.message);
        setToastType('success');
        setShowToast(true);
        refreshPendingCount();
      }
      if (event.data?.type === 'TRIGGER_ORDER_SYNC') {
        autoPushPendingOrders().then(refreshPendingCount).catch(console.error);
      }
      if (event.data?.type === 'TRIGGER_CATALOG_SYNC') {
        syncCatalog().catch(() => undefined);
      }
    };

    const handleOnline = async () => {
      setIsOnline(true);
      setToastType('online');
      setShowToast(true);

      try {
        await syncCatalog();
        await autoPushPendingOrders();
        await refreshPendingCount();
      } catch (err) {
        console.error('Auto sync failed on reconnect:', err);
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
      if (status === 'success' || status === 'failed') {
        refreshPendingCount();
      }
    };

    const handleCatalogSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      setCatalogSyncStatus(customEvent.detail.status);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('menuiserie-sync-status', handleSyncStatus);
    window.addEventListener('menuiserie-catalog-sync', handleCatalogSync);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      navigator.serviceWorker.ready.then((reg) => {
        if ('periodicSync' in reg) {
          (reg as ServiceWorkerRegistration & { periodicSync: { register: (tag: string, opts: { minInterval: number }) => Promise<void> } })
            .periodicSync.register('catalog-refresh', { minInterval: 24 * 60 * 60 * 1000 })
            .catch(() => undefined);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('menuiserie-sync-status', handleSyncStatus);
      window.removeEventListener('menuiserie-catalog-sync', handleCatalogSync);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  return (
    <ConnectivityContext.Provider
      value={{ isOnline, syncStatus, syncMessage, catalogSyncStatus, pendingOrdersCount }}
    >
      {children}

      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-[60] bg-amber-500/95 text-amber-950 text-center py-1.5 text-[10px] font-bold uppercase tracking-widest">
          Mode hors ligne
          {pendingOrdersCount > 0 && ` · ${pendingOrdersCount} commande(s) en attente de sync`}
        </div>
      )}

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
