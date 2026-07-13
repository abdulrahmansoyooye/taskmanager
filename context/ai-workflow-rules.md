# AI Workflow Rules

## Approach

Build this project incrementally using a spec-driven workflow. Context files define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior from scratch. The three roles (Admin, Project Manager, Team Member) and their core flows in `project-overview.md` define all required functionality.

## Scoping Rules

- Work on one feature unit at a time (e.g., "Project CRUD routes" not "all backend routes")
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step
- Backend routes and frontend pages for the same feature should be separate steps

## When to Split Work

Split an implementation step if it combines:

- Multiple API route domains (e.g., projects AND tasks in one step)
- Backend work AND frontend work for the same domain
- UI changes that involve different user roles (Admin vs PM vs Member views)
- Behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing

## Protected Files

Do not modify the following unless explicitly instructed:

- `backend/src/generated/prisma/*` — auto-generated Prisma client
- `node_modules/`, `frontend/node_modules/`, `backend/node_modules/`
- `.next/`, `dist/`, `build/` — build artifacts
- Any third-party library internals

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- Storage model decisions → `architecture.md`
- Code conventions or standards → `code-standards.md`
- Feature scope or user flows → `project-overview.md`
- UI tokens, layout, or component decisions → `ui-context.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. Lint checks pass (`tsc --noEmit` for backend, `npm run lint` for frontend)
