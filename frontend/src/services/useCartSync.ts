import { useLiveQuery } from 'dexie-react-hooks';
import { db, CartItem, PendingOrder, OrderPayload } from './db';
import { trySubmitOrderOnline, isRetryableError } from './orderSubmit';

export interface EmailNotification {
  sent: boolean;
  message: string;
}

function extractEmailNotification(
  result: Record<string, unknown>,
): EmailNotification | undefined {
  const raw = result.email_notification as EmailNotification | undefined;
  if (!raw || typeof raw.sent !== 'boolean') return undefined;
  return raw;
}

export const dispatchSyncEvent = (
  status: 'idle' | 'syncing' | 'success' | 'failed',
  message?: string,
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('menuiserie-sync-status', { detail: { status, message } }),
    );
  }
};

async function registerBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-orders');
    } catch (err) {
      console.warn('Background Sync registration failed:', err);
    }
  }
}

export async function syncSinglePendingOrder(pendingOrder: PendingOrder): Promise<Record<string, unknown>> {
  const result = await trySubmitOrderOnline(pendingOrder.orderData);
  return result;
}

export async function saveSyncedOrder(
  trackingCode: string,
  orderSnapshot: Record<string, unknown>,
): Promise<void> {
  await db.syncedOrderCache.put({
    trackingCode,
    orderSnapshot,
    cachedAt: Date.now(),
  });

  const all = await db.syncedOrderCache.orderBy('cachedAt').reverse().toArray();
  if (all.length > 20) {
    const toRemove = all.slice(20);
    await db.syncedOrderCache.bulkDelete(toRemove.map((o) => o.trackingCode));
  }
}

async function pushSinglePendingOrder(
  order: PendingOrder,
): Promise<{ serverCode: string; emailNotification?: EmailNotification } | null> {
  if (!order.id) return null;

  try {
    await db.pendingOrders.update(order.id, {
      status: 'syncing',
      syncAttempts: (order.syncAttempts ?? 0) + 1,
      lastAttemptAt: Date.now(),
    });

    const result = await syncSinglePendingOrder(order);
    const serverCode = (result.code_suivi as string) || `MD-${result.id}`;
    const emailNotification = extractEmailNotification(result);

    await saveSyncedOrder(serverCode, result);
    await db.pendingOrders.update(order.id, {
      status: 'synced',
      serverTrackingCode: serverCode,
    });
    await db.pendingOrders.delete(order.id);

    return { serverCode, emailNotification };
  } catch (err: unknown) {
    console.error(`Sync failed for pending order #${order.id}:`, err);
    await db.pendingOrders.update(order.id, {
      status: 'failed',
      errorMessage: err instanceof Error ? err.message : 'Unknown network error',
      lastAttemptAt: Date.now(),
    });
    return null;
  }
}

/** Sync one queued order immediately (with quick retries when online). */
export async function syncPendingOrderById(
  pendingId: number,
  options?: { silent?: boolean; retries?: number },
): Promise<{ serverCode: string; emailNotification?: EmailNotification } | null> {
  const silent = options?.silent ?? false;
  const maxAttempts = options?.retries ?? 3;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const order = await db.pendingOrders.get(pendingId);
    if (!order) {
      const cached = await db.syncedOrderCache.orderBy('cachedAt').reverse().first();
      return cached ? { serverCode: cached.trackingCode } : null;
    }

    if (!silent && attempt === 0) {
      dispatchSyncEvent('syncing', 'Transmission de votre commande...');
    }

    const syncResult = await pushSinglePendingOrder(order);
    if (syncResult) {
      if (!silent) {
        if (syncResult.emailNotification && !syncResult.emailNotification.sent) {
          dispatchSyncEvent('failed', syncResult.emailNotification.message);
        } else {
          dispatchSyncEvent('success', `Commande transmise · ${syncResult.serverCode}`);
        }
      }
      return syncResult;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }

  return null;
}

export async function autoPushPendingOrders(options?: { silent?: boolean }): Promise<number> {
  const silent = options?.silent ?? false;
  const pending = await db.pendingOrders
    .where('status')
    .anyOf(['pending', 'failed'])
    .toArray();

  if (pending.length === 0) return 0;

  if (!silent) {
    dispatchSyncEvent('syncing', `Synchronisation de ${pending.length} commande(s)...`);
  }

  let successCount = 0;
  const syncedCodes: string[] = [];
  let hasFailed = false;
  let emailWarning: string | null = null;

  for (const order of pending) {
    const syncResult = await pushSinglePendingOrder(order);
    if (syncResult) {
      successCount++;
      syncedCodes.push(syncResult.serverCode);
      if (syncResult.emailNotification && !syncResult.emailNotification.sent) {
        emailWarning = syncResult.emailNotification.message;
      }
    } else {
      hasFailed = true;
    }
  }

  if (!silent) {
    if (emailWarning && successCount > 0) {
      dispatchSyncEvent('failed', emailWarning);
    } else if (successCount > 0 && !hasFailed) {
      const codes = syncedCodes.join(', ');
      dispatchSyncEvent(
        'success',
        `${successCount} commande(s) transmise(s)${codes ? ` · ${codes}` : ''}`,
      );
    } else if (successCount > 0 && hasFailed) {
      dispatchSyncEvent(
        'success',
        `${successCount} commande(s) transmise(s). Certaines ont échoué.`,
      );
    } else if (hasFailed) {
      dispatchSyncEvent('failed', 'Échec de synchronisation de certaines commandes.');
    } else {
      dispatchSyncEvent('idle');
    }
  }

  return successCount;
}

export function useCartSync() {
  const cartItems = useLiveQuery(() => db.cart.toArray()) || [];

  const pendingOrdersCount =
    useLiveQuery(() =>
      db.pendingOrders.where('status').anyOf(['pending', 'failed']).count(),
    ) || 0;

  const addToCart = async (item: Omit<CartItem, 'updatedAt'>) => {
    const existing = await db.cart.where({ product_id: item.product_id }).toArray();

    const isMatch = existing.find(
      (e) =>
        e.customization.dimensions === item.customization.dimensions &&
        e.customization.wood === item.customization.wood &&
        e.customization.finish === item.customization.finish,
    );

    if (isMatch?.id) {
      await db.cart.update(isMatch.id, {
        quantity: isMatch.quantity + item.quantity,
        updatedAt: Date.now(),
      });
    } else {
      await db.cart.add({ ...item, updatedAt: Date.now() });
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    if (quantity <= 0) {
      await db.cart.delete(id);
    } else {
      await db.cart.update(id, { quantity, updatedAt: Date.now() });
    }
  };

  const removeFromCart = async (id: number) => {
    await db.cart.delete(id);
  };

  const clearCart = async () => {
    await db.cart.clear();
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const queueOfflineOrder = async (orderData: OrderPayload) => {
    const id = await db.pendingOrders.add({
      orderData,
      status: 'pending',
      localTrackingCode: '',
      syncAttempts: 0,
      createdAt: Date.now(),
    });

    const localTrackingCode = `MD-PENDING-${id}`;
    await db.pendingOrders.update(id, { localTrackingCode });
    await registerBackgroundSync();

    return { id, localTrackingCode };
  };

  const submitOrder = async (
    orderData: OrderPayload,
  ): Promise<{
    trackingCode: string;
    queued: boolean;
    pendingId?: number;
    emailNotification?: EmailNotification;
  }> => {
    try {
      const result = await trySubmitOrderOnline(orderData);
      const trackingCode = (result.code_suivi as string) || `MD-${result.id}`;
      const emailNotification = extractEmailNotification(result);
      await saveSyncedOrder(trackingCode, result);
      return { trackingCode, queued: false, emailNotification };
    } catch (err) {
      if (!isRetryableError(err) && typeof navigator !== 'undefined' && navigator.onLine) {
        throw err;
      }

      const { id, localTrackingCode } = await queueOfflineOrder(orderData);

      const syncResult = await syncPendingOrderById(id, { silent: true, retries: 3 });
      if (syncResult) {
        if (syncResult.emailNotification && !syncResult.emailNotification.sent) {
          dispatchSyncEvent('failed', syncResult.emailNotification.message);
        } else {
          dispatchSyncEvent('success', `Commande transmise · ${syncResult.serverCode}`);
        }
        return {
          trackingCode: syncResult.serverCode,
          queued: false,
          emailNotification: syncResult.emailNotification,
        };
      }

      return { trackingCode: localTrackingCode, queued: true, pendingId: id };
    }
  };

  return {
    cartItems,
    cartCount,
    cartTotal,
    pendingOrdersCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    queueOfflineOrder,
    submitOrder,
    syncPendingOrders: autoPushPendingOrders,
  };
}
