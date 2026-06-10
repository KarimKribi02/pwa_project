import { db } from './db';
import { getCommandeStatus } from './api';

export async function getPendingOrdersForDisplay() {
  return db.pendingOrders
    .where('status')
    .anyOf(['pending', 'failed', 'syncing'])
    .reverse()
    .sortBy('createdAt');
}

export async function getRecentSyncedOrders() {
  return db.syncedOrderCache.orderBy('cachedAt').reverse().limit(10).toArray();
}

export async function trackOrderWithCache(code: string) {
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const result = await getCommandeStatus(code);
      await db.syncedOrderCache.put({
        trackingCode: code,
        orderSnapshot: result,
        cachedAt: Date.now(),
      });
      return { order: result, fromCache: false };
    } catch (err) {
      const cached = await db.syncedOrderCache.get(code);
      if (cached) return { order: cached.orderSnapshot, fromCache: true };
      throw err;
    }
  }

  const cached = await db.syncedOrderCache.get(code);
  if (cached) return { order: cached.orderSnapshot, fromCache: true };

  const pending = await db.pendingOrders
    .filter((o) => o.localTrackingCode === code || o.serverTrackingCode === code)
    .first();

  if (pending) {
    return {
      order: {
        code_suivi: pending.localTrackingCode,
        statut: 'en attente (sync)',
        clientNom: pending.orderData.clientNom,
        prix_total: pending.orderData.prix_total,
        _pending: true,
      },
      fromCache: true,
    };
  }

  throw new Error('Commande non disponible hors ligne');
}
