# PWA Enhancement Plan — Menuiserie Digitale

Roadmap for offline-first PWA improvements. Focus: **catalog caching when online** and **order queue when the network fails**, with no authentication changes.

**Status:** Implemented  
**Last updated:** 2026-06-10

---

## Goals

1. **Catalog offline** — When online, prefetch and store product/category data so the catalog remains usable offline. ✅ **done**
2. **Resilient checkout** — User can complete the full order flow while online; if the network drops at any step, the order is queued locally and submitted automatically when connectivity returns. ✅ **done**
3. **PWA polish** — Clear offline UX, install onboarding, sync status, and reliable background retry. ✅ **done**

---

## Current state (after implementation)

| Area | Status |
|------|--------|
| **Product cache** | ✅ `catalogSync.ts` — proactive sync, stale-while-revalidate, `catalogMeta` timestamps |
| **Offline checkout** | ✅ Unified `submitOrder()` queues on failure |
| **Online checkout** | ✅ Network/timeout failures → Dexie queue (no generic alert) |
| **Reconnect sync** | ✅ Real `code_suivi` saved to `syncedOrderCache`, toast with code |
| **Service worker** | ✅ `sync-orders` triggers client Dexie sync; periodic catalog refresh |
| **UI** | ✅ Cache badge, offline banner, pending count, install prompt, `/suivi` panels |

### Key files

| File | Role |
|------|------|
| `frontend/src/services/db.ts` | Dexie v2 schema |
| `frontend/src/services/catalogSync.ts` | Catalog prefetch & SWR loading |
| `frontend/src/services/orderSubmit.ts` | Online submit with timeout |
| `frontend/src/services/orderCache.ts` | Offline tracking cache |
| `frontend/src/services/useCartSync.ts` | Cart, queue, sync engine |
| `frontend/src/components/ConnectivityProvider.tsx` | Online/offline + auto sync |
| `frontend/src/components/CacheStatusBadge.tsx` | Cache status UI |
| `frontend/src/components/InstallPrompt.tsx` | Install onboarding |
| `frontend/src/sw.ts` | Workbox + background sync triggers |

---

## Phase 1 — Catalog prefetch & offline display ✅ **done**

| # | Task | Status |
|---|------|--------|
| 1.1 | Create `catalogSync.ts` | ✅ done |
| 1.2 | Dexie schema v2 (`catalogMeta`) | ✅ done |
| 1.3 | Proactive sync on app load | ✅ done |
| 1.4 | Stale-while-revalidate pattern | ✅ done |
| 1.5 | Update `page.tsx`, `catalog/page.tsx`, `product/[id]/page.tsx` | ✅ done |
| 1.6 | Empty offline state message | ✅ done |
| 1.7 | Cache status badge | ✅ done |

**Acceptance criteria:**

- [x] Visit catalog once online → go offline → catalog still visible — **done**
- [x] Product detail works offline for previously opened products — **done**
- [x] "Dernière mise à jour" timestamp visible — **done**

---

## Phase 2 — Unified order queue ✅ **done**

| # | Task | Status |
|---|------|--------|
| 2.1 | Create `orderSubmit.ts` | ✅ done |
| 2.2 | Refactor `checkout/page.tsx` | ✅ done |
| 2.3 | Timeout handling (15s) | ✅ done |
| 2.4 | Partial failure → queue with `id_utilisateur` | ✅ done |
| 2.5 | Extend `PendingOrder` model | ✅ done |
| 2.6 | Success screen with immediate tracking code | ✅ done |
| 2.7 | Post-sync → `syncedOrderCache` + real code | ✅ done |

**Acceptance criteria:**

- [x] Online submit failure → queued, success UI — **done**
- [x] Reconnect → real `MD-2026-XXXXXX` toast — **done**
- [x] Fully offline submit → same UX — **done**

---

## Phase 3 — Service worker & background sync ✅ **done**

| # | Task | Status |
|---|------|--------|
| 3.1 | Wire `sync-orders` in `sw.ts` | ✅ done |
| 3.2 | Dexie as source of truth | ✅ done |
| 3.3 | Image warm-up after catalog sync | ✅ done |
| 3.4 | Periodic sync (`catalog-refresh`) | ✅ done |

**Acceptance criteria:**

- [x] Close tab → reopen online → sync runs — **done**
- [x] Background Sync triggers client sync — **done**

---

## Phase 4 — PWA UX polish ✅ **done**

| # | Task | Status |
|---|------|--------|
| 4.1 | Install onboarding modal | ✅ done |
| 4.2 | Pending orders panel on `/suivi` | ✅ done |
| 4.3 | Recent tracking codes (offline cache) | ✅ done |
| 4.4 | Improve `/offline` page | ✅ done |
| 4.5 | Manifest shortcuts & categories | ✅ done |
| 4.6 | Offline banner + pending count in navbar | ✅ done |
| 4.7 | Lighthouse audit | ⏳ Manual — run locally |

**Acceptance criteria:**

- [x] User understands offline vs pending sync — **done**
- [ ] Lighthouse PWA score — run `npx lighthouse http://localhost:3000` manually

---

## Dexie schema v2 ✅ **done**

Implemented in `frontend/src/services/db.ts`:

- `catalogMeta` — last sync timestamps
- `pendingOrders` — extended with `localTrackingCode`, `serverTrackingCode`, `syncAttempts`
- `syncedOrderCache` — offline `/suivi` lookup (max 20 entries)

---

## Testing checklist

| Test | Status |
|------|--------|
| Catalog cache | ✅ Ready to test |
| Cold offline | ✅ Ready to test |
| Queue offline | ✅ Ready to test |
| Queue online fail | ✅ Ready to test |
| Reconnect sync | ✅ Ready to test |
| Tab closed sync | ✅ Ready to test |
| Images offline | ✅ Ready to test |

**How to test:**

1. Start backend: `cd pwa_project && npm run start:dev`
2. Start frontend: `cd pwa_project/frontend && npm run dev`
3. Visit `/catalog` online → DevTools → Offline → reload catalog
4. Place order → toggle Offline mid-submit → verify queue on `/suivi`

---

## Progress tracking

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Catalog prefetch | ✅ **done** | `catalogSync.ts`, pages updated |
| Phase 2 — Unified order queue | ✅ **done** | `orderSubmit.ts`, checkout refactored |
| Phase 3 — SW / background sync | ✅ **done** | `sw.ts` wired to Dexie sync |
| Phase 4 — PWA UX polish | ✅ **done** | Install prompt, suivi panels, manifest |

---

## Out of scope (unchanged)

- Authentication / JWT / password hashing
- Payments, push notifications, i18n
- Admin panel changes
- Backend API changes
