# Task Management Platform

## Setup
1. `docker compose up -d`
2. `cd backend && cp .env.example .env && npm install && npx prisma migrate dev && npx prisma db seed && npm run dev`
3. `cd frontend && npm install && npm run dev`

rchitecture
[ER diagram here]

## Roles
- Admin: manages users, oversees all projects
- Project Manager: creates/manages projects and tasks
- Team Member: updates assigned tasks