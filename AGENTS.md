# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

Node >= 22.0.0 required.

## Architecture Overview

**ProSis** is a Next.js 15 (App Router) management dashboard for a young apprentice program ("Jovem Aprendiz"). It uses React 19, TypeScript strict mode, Tailwind CSS v4, and PrimeReact for UI components.

### API & Auth

- `src/services/api.ts` — Axios instance. In dev and prod, requests use same-origin `/api/proxy`; Next.js rewrites them to the internal API at `http://127.0.0.1:3333` by default.
- Auth uses a JWT cookie (`token`) for session and `localStorage` (`projov_user`) as a cached user object.
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

`src/components/header/index.tsx` renders a hierarchical nav (3+ levels deep) with animated expand/collapse, active route highlighting, and role-aware items. Each major section also has its own sidebar component (`cadsidebar`, `empsidebar`, `pedagogicosidebar`, `acessosidebar`).

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

Domain entity types live in `src/types/index.ts`. API wrapper types (`DefaultResponse`) live in `src/types/api.ts`. Service functions use `AxiosResponse<DefaultResponse<T>>` for typed responses with `data` and `meta` (pagination).
