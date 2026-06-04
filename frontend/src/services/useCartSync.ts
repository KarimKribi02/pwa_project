import { useLiveQuery } from 'dexie-react-hooks';
import { db, CartItem, PendingOrder } from './db';
import { createOrder, getUserByEmail } from './api';

// Sync State Event Dispatcher helpers
// Used to notify the UI connectivity indicator of sync operations
export const dispatchSyncEvent = (status: 'idle' | 'syncing' | 'success' | 'failed', message?: string) => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('menuiserie-sync-status', {
      detail: { status, message }
    });
    window.dispatchEvent(event);
  }
};

/**
 * Helper to process user resolution and order creation.
 * Resolves or creates a user on the fly before creating the order.
 */
export async function syncSinglePendingOrder(pendingOrder: PendingOrder): Promise<any> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const { orderData } = pendingOrder;

  let userId = orderData.id_utilisateur;

  // If we don't have a userId yet, we need to resolve it by email
  if (!userId && orderData.clientEmail) {
    try {
      const user = await getUserByEmail(orderData.clientEmail);
      userId = user.id?.toString();
    } catch (err) {
      // User doesn't exist, let's create a guest profile
      try {
        const newUserRes = await fetch(`${API_URL}/addUtilisateur`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: orderData.clientNom,
            email: orderData.clientEmail,
            mot_passe: Math.random().toString(36).slice(-8), // Random temp password
            role: 'user'
          }),
        });

        if (newUserRes.ok) {
          const newUser = await newUserRes.json();
          userId = newUser.id?.toString();
        }
      } catch (userCreateErr) {
        console.error("Failed to create guest user during sync:", userCreateErr);
        // Fallback: we will try to proceed without user ID if backend allows
      }
    }
  }

  // Construct final order payload
  const finalPayload = {
    ...orderData,
    id_utilisateur: userId
  };

  // Submit the order
  return await createOrder(finalPayload);
}

/**
 * Main Thread Order Sync Engine
 * Iterates through Dexie's pendingOrders table, pushes them to the API,
 * and manages UI status updates.
 */
export async function autoPushPendingOrders(): Promise<number> {
  const pending = await db.pendingOrders.where('status').equals('pending').toArray();
  if (pending.length === 0) return 0;

  dispatchSyncEvent('syncing', `Synchronisation de ${pending.length} commande(s)...`);
  let successCount = 0;
  let hasFailed = false;

  for (const order of pending) {
    if (!order.id) continue;
    try {
      // Update local status to syncing
      await db.pendingOrders.update(order.id, { status: 'syncing' });
      
      // Perform order synchronization
      await syncSinglePendingOrder(order);

      // Remove successfully synced order from IndexedDB
      await db.pendingOrders.delete(order.id);
      successCount++;
    } catch (err: any) {
      console.error(`Sync failed for pending order #${order.id}:`, err);
      hasFailed = true;
      await db.pendingOrders.update(order.id, { 
        status: 'failed',
        errorMessage: err.message || 'Unknown network error'
      });
    }
  }

  if (successCount > 0 && !hasFailed) {
    dispatchSyncEvent('success', `${successCount} commande(s) transmise(s) à l'atelier !`);
  } else if (hasFailed) {
    dispatchSyncEvent('failed', "Échec de synchronisation de certaines commandes.");
  } else {
    dispatchSyncEvent('idle');
  }

  return successCount;
}

export function useCartSync() {
  // Live query for cart items from IndexedDB
  const cartItems = useLiveQuery(() => db.cart.toArray()) || [];
  
  // Live query for pending orders count
  const pendingOrdersCount = useLiveQuery(() => 
    db.pendingOrders.where('status').equals('pending').count()
  ) || 0;

  // --- Cart Actions ---

  const addToCart = async (item: Omit<CartItem, 'updatedAt'>) => {
    // Check if item with exact same configuration already exists
    const existing = await db.cart.where({
      product_id: item.product_id
    }).toArray();

    const isMatch = existing.find(e => 
      e.customization.dimensions === item.customization.dimensions &&
      e.customization.wood === item.customization.wood &&
      e.customization.finish === item.customization.finish
    );

    if (isMatch && isMatch.id) {
      // Increment quantity
      await db.cart.update(isMatch.id, {
        quantity: isMatch.quantity + item.quantity,
        updatedAt: Date.now()
      });
    } else {
      // Add as new entry
      await db.cart.add({
        ...item,
        updatedAt: Date.now()
      });
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

  // Calculate cart totals
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // --- Checkout Action ---

  const queueOfflineOrder = async (orderData: PendingOrder['orderData']) => {
    // Write order into Dexie DB
    const id = await db.pendingOrders.add({
      orderData,
      status: 'pending',
      createdAt: Date.now()
    });

    // Register Background Sync if service worker is active
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-orders');
        console.log('Background Sync registered successfully via Service Worker');
      } catch (err) {
        console.warn('Service Worker Sync registration failed, relying on main-thread sync:', err);
      }
    }

    return id;
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
    syncPendingOrders: autoPushPendingOrders
  };
}
