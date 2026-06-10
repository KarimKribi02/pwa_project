# PWA Project — Agent Context

Progressive web app for **Menuiserie Digitale**, a custom woodworking / menuiserie business (Marrakech). Customers browse a catalog, customize products, place orders, and track them. Admins manage products, orders, invoices, and contact messages.

UI copy and domain terms are mostly **French**.

## Repository layout

```
pwa_project/
├── src/                 # NestJS backend (TypeScript)
├── prisma/              # Prisma schema (PostgreSQL / Supabase)
├── frontend/            # Next.js 16 PWA (React 19, Tailwind)
├── test/                # Backend e2e tests
├── dist/                # Compiled backend output
└── *.ps1, seed*.sql     # Local scripts / seed data
```

Workspace root (`PWA/`) may contain ancillary files (e.g. `pwa_report.html`).

## Run locally

**Backend** (port **3001**):

```bash
cd pwa_project
npm install
npm run start:dev
```

**Frontend** (port **3000**):

```bash
cd pwa_project/frontend
npm install
npm run dev
```

**Environment variables**

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | backend `.env` | PostgreSQL connection (Supabase). Do not hardcode credentials in code or docs. |
| `PORT` | backend `.env` | API port (default `3001`) |
| `NEXT_PUBLIC_API_URL` | frontend `.env` | API base, e.g. `http://localhost:3001/api` |
| SMTP vars | backend `.env` | Order confirmation / status emails (`email/` module) |

## Architecture

```
Browser (Next.js PWA)
  ├── fetch → NestJS REST API (/api/*)
  ├── Dexie (IndexedDB) → offline catalog cache + cart + pending orders
  └── Service worker (next-pwa, src/sw.ts)
         ↓
NestJS 11 + Prisma 6 → PostgreSQL (Supabase)
```

### Backend (`pwa_project/src/`)

- **Framework**: NestJS 11, global CORS, `ValidationPipe` on all routes.
- **ORM**: Prisma; BigInt IDs serialized to **strings** in JSON responses.
- **Route prefix**: all REST endpoints use `/api/...` (defined on each controller).
- **Modules** (PascalCase folders, French domain):

| Module | Responsibility |
|--------|----------------|
| `Categories` | Product categories |
| `Produits` | Products + featured / by-category |
| `Images_produit` | Product images (multer upload) |
| `Utilisateurs` | Users / admin login |
| `Commandes` | Orders, tracking, status workflow |
| `ArticlesCommande` | Order line items |
| `Factures` | Invoices linked to orders |
| `Contact` | Contact form + admin message inbox |
| `email` | Nodemailer notifications |

Key patterns:

- Controllers return frontend-friendly shapes (e.g. `formatCommandeResponse` nests `utilisateurs`, `produits`, `items`, `factures`).
- Order tracking codes: `MD-2026-XXXXXX` (6 alphanumeric chars).
- Order status flow: `en attente` → `en cours` → `terminer` via `PUT /api/ValidateCommande/:id` with `{ action: "start" | "complete" }`.

### Frontend (`pwa_project/frontend/`)

- **Stack**: Next.js **16.2.1**, React 19, Tailwind CSS, Framer Motion, Lucide icons.
- **PWA**: `next-pwa` with custom service worker at `src/sw.ts`.
- **Offline**: Dexie DB `MenuiserieDigitalDB` (`services/db.ts`) caches catalog; `services/api.ts` falls back to IndexedDB when fetch fails.
- **Cart / sync**: `services/useCartSync.ts` queues orders offline and syncs when online.
- **API client**: single module `frontend/src/services/api.ts` — add new endpoints here.

**Public routes**: `/`, `/catalog`, `/product/[id]`, `/checkout`, `/contact`, `/suivi` (order tracking), `/about`, `/offline`.

**Admin routes** (`/admin/*`): dashboard, products, categories, orders, billing (factures), messages, login.

For Next.js 16 specifics (breaking changes vs older versions), see `frontend/AGENTS.md`.

## Data model (Prisma)

Main entities: `categories`, `produits`, `produits_images`, `commandes`, `ArticleCommande`, `facture`, `utilisateurs`, `Contact`.

Orders store client fields inline (`clientNom`, `clientTel`, `clientEmail`, `adresse`) plus customization fields (`largeur`, `longueur`, `couleur`, `type_bois`).

## Conventions

- **Language**: user-facing strings in French; code comments mix French and English.
- **IDs**: backend uses `BigInt`; API responses use string IDs.
- **Naming**: backend modules/DTOs use French names (`ajouterCommande.dto.ts`, `AllProduits`).
- **Minimal diffs**: match existing module-per-feature structure; don't refactor unrelated code.
- **Secrets**: never commit `.env` files or paste live DB/SMTP credentials into source or docs.

## Known issues

- `README.md` contains unresolved git merge conflict markers — resolve before publishing docs.
- `prisma/schema.prisma` may contain a hardcoded `DATABASE_URL`; prefer `env("DATABASE_URL")` and `.env` locally.

## Useful scripts

| Script | Purpose |
|--------|---------|
| `test_api.ps1` | Manual API smoke tests |
| `check_commandes.ps1` | Order inspection |
| `seed.js` / `seed.sql` | Database seeding |
| `TODO.md` | Active frontend tasks |

## Testing

```bash
# Backend unit tests
cd pwa_project && npm test

# Frontend lint
cd pwa_project/frontend && npm run lint
```
