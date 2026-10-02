# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

Read `docs/CONTEXTO_PROSIS.md` first for the current product scope, monorepo setup, login flow and verified limitations (updated 2026-10-01). API-specific guidance is in `apps/api/AGENTS.md`. Hostinger via GitHub uses the Next.js preset; see `docs/hostinger-deploy.md`. Older Other/custom-server instructions and Railway notes are historical.

## Commands

```bash
npm run dev      # Check configuration and start BOTH Next.js and Fastify
npm run dev:web  # Start only Next.js (login still requires the API)
npm run api:install # Install the API's separate dependencies
npm run build    # Install API dependencies from lock, build API then Next standalone
npm run start    # Start standalone Next with embedded Fastify
npm run test:deploy # Verify isolated standalone package after a build
npm run lint     # ESLint
```

Node >= 22.0.0 required.

## Architecture Overview

**ProSis** is a Next.js 15 (App Router) management dashboard for a young apprentice program ("Jovem Aprendiz"). It uses React 19, TypeScript strict mode, Tailwind CSS v4, and PrimeReact for UI components.

### API & Auth

- `src/services/api.ts` — Axios instance uses same-origin `/api/proxy`. In production, a Pages API catch-all passes raw HTTP requests directly to embedded Fastify. Development retains the rewrite to `http://127.0.0.1:3333`.
- Login uses `POST /api/auth/login` in Next.js, calls Fastify `POST /login` in process in production (HTTP in development), and sets the HTTP-only JWT cookie (`token`). `localStorage` (`projov_user`) caches user display data.
- Production Fastify is created lazily from `apps/api/dist/app.js`; it does not listen on a port. The API builds before Next traces its runtime files. Runtime secrets belong in hPanel; standalone output must not contain copied root `.env` files. Build and healthcheck do not query MySQL.
- `src/components/PrivateLayout/index.tsx` enforces auth/role guards client-side. APRENDIZ users are restricted to their own profile page only.

### Role System

Roles are single-character codes mapped in `src/utils/roles.ts`:
`A`=Admin, `C`=Recepção, `P`=Pedagógico, `T`=Técnico, `E`=Empresarial, `S`=Pesquisa, `D`=Desligado, `DEV`=Desenvolvedor, `APRENDIZ`=Aprendiz.

### CRUD Pattern

Most pages follow a consistent pattern:

1. **Hook** — `src/hooks/useCrud.ts` is a generic hook that manages paginated fetch, search (500ms debounce), modal state, and CRUD operations with toast feedback.
2. **Service** — one file per domain in `src/services/` (e.g., `ocorrenciaTipoService.ts`) exporting typed `getAll`, `create`, `update`, `delete` functions.
3. **Page** — calls `useCrud`, passes state to a `Tabela*` component and a form `Modal`.
4. **Table component** — in `src/components/tabelas/`, receives data + callbacks, renders loading/error/empty states.
5. **Form component** — in `src/components/forms/`, receives `formData` + `handleChange`, renders grid layout.

### Navigation

`src/components/navigation/index.tsx` renders the authenticated app shell: collapsible sidebar, searchable mega-menu, mobile drawer and account footer. `navigation.ts` is the central role-aware route catalog; `header/index.tsx` contains only the toolbar and breadcrumbs. `PrivateLayout` mounts the shell outside public pages and the independent `/chamados` screens. Legacy section sidebars return null under `NavigationContext` to avoid duplicate navigation. Use `npm run test:navigation` to validate destinations and role visibility. Sidebar state persists in `prosis-sidebar-collapsed`; theme still uses `prosis-theme`.

### Interface preferences

`/configuracoes` manages appearance, navigation and ticket sounds. `InterfacePreferencesProvider` and `useInterfacePreferences` are the single source for theme (`light`, `dark`, `system`), sidebar collapse and reduced motion. Keep the nonce-protected bootstrap in sync with `src/utils/interfacePreferences.ts`; do not write theme storage directly from pages. Ticket pages keep their palettes but consume the shared theme. `useChamadoNotificationPreferences` manages only browser settings and must not poll; `useChamadoNotifications` adds polling in the ticket module. These preferences are browser-local, not per-account server settings. Run `npm run test:settings` for migration, validation and storage-failure coverage.

### Key Libraries

| Purpose | Library |
|---|---|
| Forms + validation | React Hook Form + Zod |
| UI components | PrimeReact (Lara Light Blue theme) |
| HTTP | Axios |
| Notifications | react-hot-toast |
| Date utilities | date-fns |
| Cookies | js-cookie |
| Icons | Lucide React, Heroicons, Primeicons |

### Path Alias

`@/*` maps to `./src/*`.

### Type Conventions

Domain entity types live in `src/types/index.ts`. `src/types/api.ts` contains a non-generic message/success response. Paginated responses and direct arrays currently coexist. Use `src/utils/apiResponse.ts` for structural validation and domain schemas for item validation; do not assume every response has the same envelope.
