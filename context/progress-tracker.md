# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

Completed — Kanban board implementation and API route fixes.

## Current Goal

Kanban board component integrated with correct API endpoints across all dashboards.

## Completed

- [x] Project scaffold: Express + TypeScript + Prisma + Next.js + Tailwind
- [x] Database schema: User, Project, Task, ProjectMember, TaskComment models
- [x] Prisma migration and seed script (3 seed users with different roles)
- [x] Auth routes: register and login with bcrypt + JWT
- [x] Auth middleware: `requireAuth` and `requireRole` guards
- [x] context files updated with full project specification and role flows
- [x] Frontend API client (`lib/api.ts`) with Axios
- [x] Zustand auth store (`store/auth.ts`) with login, register, logout
- [x] Login page (`app/login/page.tsx`) with form, error display, role-based redirect
- [x] Register page (`app/register/page.tsx`) with form, error display, redirect to login
- [x] Both backend (`tsc --noEmit`) and frontend (`tsc --noEmit`) builds verified green
- [x] Backend user management API: `GET /api/users`, `POST /api/users`, `PATCH /api/users/:id/role`, `DELETE /api/users/:id`
- [x] Admin dashboard page with system stats (user/project counts by role/status)
- [x] User management page with table, inline role editing, create user form, delete user
- [x] Sidebar updated to show admin navigation (Dashboard, Users) for ADMIN role
- [x] Backend: Project CRUD routes (create, list, update, delete, status change)
- [x] Backend: Project member management routes (list, add, remove)
- [x] Backend: Task CRUD routes (create, list, update, update status, delete)
- [x] Backend: Task comment routes (list, create)
- [x] Backend: `GET /api/tasks/:id` single task endpoint
- [x] Frontend hooks: `useProjects` (list, detail, create, update, status, delete)
- [x] Frontend hooks: `useMembers` (list, add, remove)
- [x] PM Dashboard page (`/pm`) with project stats and active project cards
- [x] PM Projects list page (`/pm/projects`) with table, create, delete
- [x] PM Project detail page (`/pm/projects/[id]`) with Kanban board, task creation, member management, project editing/status/delete
- [x] PM Task detail page (`/pm/projects/[id]/tasks/[taskId]`) with status updates, edit modal, comments, delete
- [x] Sidebar updated with PM navigation (Dashboard, Projects)
- [x] `Comment` and `TaskDetail` types added to shared types
- [x] Login page already redirects PM role to `/pm`

## Open Questions

- Should the frontend use a UI component library (shadcn/ui, Radix) or keep fully custom Tailwind?
- Which CI/CD provider? (GitHub Actions assumed)
- Should avatar/initials be included in the User model?

## Architecture Decisions

- **JWT over sessions**: Stateless auth simplifies scaling. Token stored in httpOnly cookie for security + Bearer header for mobile/api client flexibility.
- **Zod over class-validator**: Lightweight, tree-shakeable, works seamlessly with TypeScript inference.
- **Prisma over raw SQL / Drizzle**: Prisma provides type-safe generated client, migrations, and a clean schema DSL that matches the relational model well.
- **Next.js App Router over Pages Router**: Modern React patterns with server components, layouts, gand streaming.

## Session Notes

- Project scaffold completed with Express 5, Next.js 16, Prisma 7, PostgreSQL on Supabase
- Auth middleware supports both cookie and Bearer token extraction
- Three roles defined: ADMIN, PROJECT_MANAGER, TEAM_MEMBER
- Kanban board planned as frontend component with column-based drag (To Do → In Progress → Done)
- Fixed backend task route structure: removed redundant `/tasks/` prefix, added `GET /api/tasks` for member's own tasks
- Fixed frontend API URL mismatches across PM project detail page, member pages, and useTasks hook
- Fixed `TaskCard` to use `assignee?.name` instead of non-existent `project?.name`
- Fixed `ProjectDetail` type to include `id`/`userId` on member objects
- All TypeScript strict-mode builds verified green
