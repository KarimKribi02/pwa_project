import { getUserByEmail } from './api';
import type { OrderPayload } from './db';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const FETCH_TIMEOUT_MS = 15000;

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function isRetryableError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err instanceof Error && /failed|network|abort|fetch/i.test(err.message)) return true;
  return false;
}

export type SubmitOrderResult =
  | { type: 'success'; trackingCode: string; order: Record<string, unknown> }
  | { type: 'queued'; localTrackingCode: string; pendingId: number };

/** Try the full online pipeline: resolve user → create order. Throws on retryable failures. */
export async function trySubmitOrderOnline(
  payload: OrderPayload,
): Promise<Record<string, unknown>> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new TypeError('Device is offline');
  }

  let userId = payload.id_utilisateur;

  if (!userId && payload.clientEmail) {
    try {
      const user = await getUserByEmail(payload.clientEmail);
      userId = user.id?.toString();
    } catch {
      const newUserRes = await fetchWithTimeout(`${API_URL}/addUtilisateur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: payload.clientNom,
          email: payload.clientEmail,
          mot_passe: Math.random().toString(36).slice(-8),
          role: 'user',
        }),
      });

      if (!newUserRes.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = await newUserRes.json();
      userId = newUser.id?.toString();
    }
  }

  const finalPayload = { ...payload, id_utilisateur: userId };

  const res = await fetchWithTimeout(`${API_URL}/addCommande`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalPayload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(
      (errorData as { message?: string }).message || 'Failed to create order',
    );
    if (res.status >= 500) throw err;
    throw err;
  }

  return res.json();
}

export { isRetryableError };
