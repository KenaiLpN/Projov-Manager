# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# Development (hot reload)
npm run dev

# Build TypeScript
npm run build

# Run compiled server
npm start

# Regenerate Prisma client (after schema changes)
npx prisma generate

# Push schema changes to database
npx prisma db push

# Open Prisma Studio (GUI for database)
npx prisma studio
```

## Architecture

This is a REST API for an apprenticeship management system (ProSis), built with **Fastify v5**, **Prisma ORM**, and **MySQL**.

### Request Flow

```
Route (Zod schema validation) → Service (business logic) → Prisma → MySQL
```

Every resource follows this 3-layer pattern with dedicated files in:
- `src/routes/` — Fastify route definitions with Zod schemas inline or imported from `src/schemas/`
- `src/services/` — Business logic and Prisma queries
- `src/schemas/` — Zod schemas for request/response validation

### Key Infrastructure (`src/lib/`)

- **`prisma.ts`** — Singleton Prisma client (reuses global instance in dev to avoid connection pool exhaustion)
- **`baseService.ts`** — Abstract base class providing generic paginated `getAll`, `getById`, `create`, `update`, `delete` — currently only GrauParentescoService extends this
- **`nextId.ts`** — Generates sequential IDs via `MAX(column)` for tables without auto-increment (many tables use this pattern instead of auto-increment)

### Authentication

JWT tokens are issued at `POST /login` and stored in HTTP-only cookies. The `@fastify/jwt` plugin verifies them on protected routes. Four login types: USUARIO, APRENDIZ, EDUCADOR and EMPRESA. Session claims must pass lib/sessionClaims.ts after JWT signature verification. Recovery tokens are not sessions.

### Deployment

Current deployment target is Hostinger's Next.js preset via GitHub: main, Node 22.x, root ./, build npm run build, output .next. Root npm start runs .next/standalone/server.js. src/app.ts creates Fastify without listen(); production Next routes share a lazy instance and route requests directly, without an API port or child process. src/server.ts remains the listener entry point for development and independent API use. The root build compiles this package first and traces dist, dependencies and generated Prisma into standalone. Secrets must be supplied through the runtime environment; build and /health do not query MySQL. New deployment validation is pending. See ../../docs/hostinger-deploy.md.

The Other preset, scripts/start-production.mjs and scripts/run-api-production.mjs belong to the previous deployment architecture. They remain optional legacy commands and are not required by the current preset.

### API Documentation

Swagger/Scalar dependencies exist, but current app.ts does not register a /docs UI. Do not assume installed packages imply active endpoints.

### Database Schema

Prisma schema is in `prisma/schema.prisma` (MySQL). Models use audit fields (`criado_em`, `atualizado_em`) and status-based soft deletes. Many foreign keys are managed manually due to the legacy database structure.

### Adding a New Resource

Follow this pattern (look at any existing simple resource like `src/routes/conceito.routes.ts` + `src/services/ConceitoService.ts`):

1. Create `src/services/XService.ts` — extend `BaseService` or write custom Prisma calls
2. Create `src/routes/x.routes.ts` — define Fastify routes with Zod validation
3. Register the route in `src/app.ts` with `app.register()`
