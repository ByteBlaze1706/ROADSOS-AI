# ROADSOS AI

An AI-powered emergency response platform for road safety — a futuristic PWA with SOS alerts, crash detection, AI chat, live maps, and medical ID.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, Framer Motion, Wouter, shadcn/ui
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- PWA: manifest.json + service worker

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — DB schema (profiles, sos_alerts, incidents, chat_messages)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/roadsos/src/` — React frontend
  - `src/lib/auth.tsx` — Auth context (localStorage-based, userId="demo-user")
  - `src/components/ProtectedRoute.tsx` — Route guard
  - `src/components/Layout.tsx` — Bottom nav layout
  - `src/pages/` — All 14 app pages

## Architecture decisions

- Auth is localStorage-based (no Firebase) — userId defaults to "demo-user". Add Firebase Auth later if needed.
- No Google Maps API used — map is stylized CSS/SVG with dummy markers. Add Maps JS API later.
- AI chat uses keyword-matching responses (no OpenAI) — responses are pre-programmed for common emergencies.
- Nearby services are hardcoded on the server — no real Places API integration needed for demo.
- PWA manifest + service worker registered for installability.

## Product

ROADSOS AI provides: splash/auth screens, a golden-hour HUD dashboard with animated SOS button, AI crash detection with simulated G-force sensor, severity analyzer for accident images, live map with service filters, smart medical ID with QR code, AI emergency chat assistant, incident history, and profile management.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `useAuth` must be imported from `@/lib/auth` (not relative `./auth`)
- Seeded demo profile for "demo-user" in DB (O+ blood group, Alex Kumar)
- Run codegen after any OpenAPI spec change before touching frontend code

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
