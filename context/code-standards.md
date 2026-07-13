# Code Standards

## General

- Keep modules small and single-purpose
- Fix root causes, do not layer workarounds
- Do not mix unrelated concerns in one component or route
- Favor readability over brevity — meaningful names > terse names

## TypeScript

- Strict mode is required throughout the project (enabled in both `tsconfig.json` files)
- Avoid `any` — use explicit interfaces or narrowly scoped types
- Validate unknown external input at system boundaries (Zod schemas) before trusting it
- Prefer `type` over `interface` for union/intersection types; use `interface` for object shapes that may be extended
- Use `AuthRequest` extension for request objects carrying authenticated user data

## Express / Backend

- Route handlers are defined in `backend/src/routes/` — one file per domain (auth, users, projects, tasks, comments)
- Middleware is defined in `backend/src/middleware/` — `requireAuth` and `requireRole` for access control
- Prisma client is a singleton exported from `backend/src/utils/prisma.ts`
- Route files export a `Router` instance mounted in `app.ts`
- Error responses use shape `{ error: string }`; success responses use `{ data }` or direct JSON

## Next.js / Frontend

- Default to server components; add `'use client'` only when browser interactivity (hooks, event handlers) requires it
- Keep route handlers (API routes) focused on a single responsibility
- Use TanStack React Query for server state (API data fetching and caching)
- Use Zustand for client-only UI state (sidebar open, active filters)
- Axios instance with base URL and withCredentials: true for API calls

## Styling

- Use Tailwind utility classes exclusively — no CSS modules or inline styles
- Use CSS custom property tokens defined in `globals.css` — no hardcoded hex values
- Follow the border radius scale defined in `ui-context.md`

## API Routes

- Validate and parse request input with Zod before any logic runs
- Enforce auth (`requireAuth`) and role (`requireRole`) before any mutation
- Return consistent, predictable response shapes
- Use HTTP status codes meaningfully: 200 success, 201 created, 400 validation error, 401 unauthenticated, 403 unauthorized, 404 not found, 409 conflict, 500 server error

## Data and Storage

- All application data lives in PostgreSQL via Prisma ORM
- Prisma schema in `backend/prisma/schema.prisma` is the single source of truth
- Run `npx prisma migrate dev` for schema changes — never alter the database directly
- Seed data lives in `backend/prisma/seed.ts`

## File Organization

- `backend/src/routes/` — Route handlers per domain
- `backend/src/middleware/` — Express middleware
- `backend/src/utils/` — Shared utilities
- `backend/prisma/` — Database schema, migrations, seed
- `frontend/app/` — Next.js App Router pages and layouts
- `frontend/components/` — Reusable UI components
- `frontend/lib/` — API client, utilities, hooks
- `frontend/store/` — Zustand stores
- `frontend/types/` — Shared TypeScript types
