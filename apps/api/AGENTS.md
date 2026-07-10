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
- **`baseService.ts`** — Abstract base class providing generic paginated `getAll`, `getById`, `create`, `update`, `delete` — most services extend this
- **`nextId.ts`** — Generates sequential IDs via `MAX(column)` for tables without auto-increment (many tables use this pattern instead of auto-increment)

### Authentication

JWT tokens are issued at `POST /login` and stored in HTTP-only cookies. The `@fastify/jwt` plugin verifies them on protected routes. Two user types: `APRENDIZ` (apprentice-facing) and admin system users.

### Deployment

Supports both local Fastify server and **Vercel serverless** — `vercel.json` routes all requests to `src/server.ts`. The `server.ts` exports the Fastify app for Vercel and also calls `listen()` for local use.

### API Documentation

Swagger UI is available at `/docs` when running locally (registered via `@fastify/swagger` and `@scalar/fastify-api-reference`).

### Database Schema

Prisma schema is in `prisma/schema.prisma` (MySQL). Models use audit fields (`criado_em`, `atualizado_em`) and status-based soft deletes. Many foreign keys are managed manually due to the legacy database structure.

### Adding a New Resource

Follow this pattern (look at any existing simple resource like `src/routes/conceito.routes.ts` + `src/services/ConceitoService.ts`):

1. Create `src/services/XService.ts` — extend `BaseService` or write custom Prisma calls
2. Create `src/routes/x.routes.ts` — define Fastify routes with Zod validation
3. Register the route in `src/server.ts` with `app.register()`
