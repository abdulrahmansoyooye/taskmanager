# Task Management Platform

## Overview

A multi-role task management platform that enables organizations to manage users, projects, and tasks with role-based access control. Supports three distinct roles — Admin, Project Manager, and Team Member — each with tailored permissions and views.

## Goals

1. Provide secure authentication and role-based access control
2. Allow Admins to manage users, roles, and oversee all projects
3. Allow Project Managers to create projects, assign members, and manage tasks
4. Allow Team Members to view assigned tasks and update their progress

## Core Flows

### Admin Flow
1. Logs in → sees system dashboard (user count, project count)
2. Manage Users: list, create, edit role, deactivate/delete
3. Manage Projects: view all projects across the system (oversight)
4. Manage system settings/roles

### Project Manager Flow
1. Logs in → sees "My Projects" dashboard
2. Create Project (name, description)
3. Add team members to project → creates ProjectMember rows
4. Create Tasks within a project, assign to a team member, set priority/due date
5. Monitor task board (Kanban: To Do / In Progress / Done)
6. Edit/delete tasks, reassign, close project

### Team Member Flow
1. Logs in → sees "My Tasks" dashboard (filtered to assigned tasks)
2. View project details for projects they're a member of (read-only)
3. Update task status (To Do → In Progress → Done)
4. Add comments/progress notes on a task
5. Cannot create projects, assign tasks, or see others' tasks

## Features

### Authentication & Authorization
- Register and login with JWT-based authentication
- Role-based middleware guards (Admin, Project Manager, Team Member)
- HttpOnly cookie + Bearer token support

### User Management (Admin)
- List, create, and edit users
- Assign/change roles
- Deactivate or delete users

### Project Management (Project Manager)
- Create and manage projects
- Add/remove team members
- Close or archive projects

### Task Management
- Create tasks with title, description, priority, due date
- Assign tasks to project members
- Kanban-style status board (To Do / In Progress / Done)
- Task comments and progress notes

## Scope

### In Scope
- Three-role RBAC system (Admin, PM, Team Member)
- JWT authentication with secure cookies
- Project CRUD with member assignment
- Task CRUD with assignee, priority, due date, comments
- Kanban status management
- Role-specific dashboards
- RESTful API with Express + Prisma + PostgreSQL

### Out of Scope
- Real-time notifications or WebSockets
- File/image uploads
- Calendar/gantt views
- Email notifications
- OAuth/social login providers

## Success Criteria

1. Admin can log in, view system stats, manage users and all projects
2. Project Manager can create a project, add members, create/assign tasks, and move tasks through a Kanban board
3. Team Member can log in, see only their assigned tasks, update status, and add comments
4. Role-based guards prevent unauthorized access to endpoints and views
5. All API responses follow consistent error/ success shapes
