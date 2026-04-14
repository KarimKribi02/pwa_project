# Menuiserie Digitale - Frontend

Digital showcase for a premium carpenter in Marrakech.

## Tech Stack
- **Next.js 15 (App Router)**
- **Tailwind CSS 4**
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **next-pwa** (PWA support)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production (to test PWA):
   ```bash
   npm run build
   npm run start
   ```

## Folder Structure
- `src/app`: App Router pages and layouts.
- `src/services`: API utility to connect with Laravel Backend.
- `public`: PWA manifest, icons, and assets.
- `src/app/globals.css`: Tailwind 4 theme configuration (Wood Palette).

## PWA Configuration
The PWA is configured via `next.config.js` using `next-pwa`. It includes:
- `manifest.json` registration.
- Offline support (Service Worker generated at build time).
- Mobile-first meta tags in `src/app/layout.tsx`.
- Standalone display mode.

## API Integration
The frontend is pre-configured to fetch from `http://localhost:8000/api`. You can change this in `src/services/api.ts` or by setting `NEXT_PUBLIC_API_URL` env variable.
