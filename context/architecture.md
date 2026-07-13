# Architecture Context

## Stack

| Layer       | Technology                          | Role                                    |
| ----------- | ----------------------------------- | --------------------------------------- |
| Backend     | Node.js + Express 5 + TypeScript    | RESTful API server                      |
| Frontend    | Next.js 16 + TypeScript             | SSR React application                   |
| UI          | Tailwind CSS v4                     | Utility-first styling                   |
| Database    | PostgreSQL via Prisma ORM           | Persistent storage with migrations      |
| Auth        | JWT + bcrypt                        | Secure authentication & RBAC            |
| Validation  | Zod                                 | Runtime input validation                |
| HTTP Client | Axios + TanStack React Query        | API requests & caching                  |
| State       | Zustand                             | Client-side state management            |

## System Boundaries

- `backend/src/routes/` — Route handlers (auth, users, projects, tasks, comments)
- `backend/src/middleware/` — Auth guards (`requireAuth`, `requireRole`)
- `backend/src/utils/` — Shared utilities (Prisma client)
- `backend/prisma/` — Schema, migrations, seed
- `frontend/app/` — Next.js App Router pages and layouts
- `frontend/components/` — Shared UI components

## Storage Model

- **PostgreSQL**: All data — users, projects, tasks, memberships, comments. Managed via Prisma schema and migrations.
- **JWT tokens**: In-memory on client (httpOnly cookie + Bearer header). No token store in DB.

## Auth and Access Model

- **Authentication**: User registers/logs in via `POST /api/auth/register` and `POST /api/auth/login`. Server signs a JWT containing `{id, role}` with a 7-day expiry.
- **Token transport**: JWT is set as an httpOnly cookie (`sameSite: strict`) and also returned in the response body for Bearer header usage.
- **Authorization**: Every protected route uses `requireAuth` middleware to verify the JWT. Role-specific routes add `requireRole('ADMIN')`, `requireRole('PROJECT_MANAGER')`, etc.
- **Ownership**: Projects belong to a creator (User). Tasks are assigned to individual users. PM can manage tasks within their own projects. Members can only update tasks assigned to themselves.

## Invariants

1. Request handlers validate input with Zod before any logic runs
2. All mutation endpoints require authentication via `requireAuth`
3. Role-based endpoints reject unauthorized users with 403 before processing data
4. Passwords are never stored in plaintext — always bcrypt-hashed
5. API responses use consistent shapes: `{data}` for success, `{error}` for errors
6. Prisma migrations are the single source of truth for the database schema
