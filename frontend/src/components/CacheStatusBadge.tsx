'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Database } from 'lucide-react';
import { useConnectivity } from './ConnectivityProvider';
import { getLastSyncTime } from '@/services/catalogSync';

function formatSyncTime(timestamp: number | null): string {
  if (!timestamp) return 'jamais';
  return new Date(timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CacheStatusBadge() {
  const { isOnline, catalogSyncStatus } = useConnectivity();
  const [lastSync, setLastSync] = useState<number | null>(null);

  useEffect(() => {
    getLastSyncTime().then(setLastSync);

    const refresh = () => getLastSyncTime().then(setLastSync);
    window.addEventListener('menuiserie-catalog-sync', refresh);
    return () => window.removeEventListener('menuiserie-catalog-sync', refresh);
  }, []);

  if (catalogSyncStatus === 'syncing') {
    return (
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">
        <RefreshCw size={12} className="animate-spin" />
        <span>Sync catalogue...</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
        isOnline ? 'text-emerald-700/80' : 'text-amber-700/80'
      }`}
      title={isOnline ? 'Catalogue synchronisé' : 'Mode hors ligne'}
    >
      {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
      <Database size={12} />
      <span>
        {isOnline ? 'En ligne' : 'Hors ligne'}
        {' · '}
        {isOnline ? `Sync ${formatSyncTime(lastSync)}` : `Cache ${formatSyncTime(lastSync)}`}
      </span>
    </div>
  );
}
