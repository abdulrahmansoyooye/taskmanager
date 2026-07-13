# Task Manager API

Base URL: `http://localhost:4000/api`

## Authentication

All authenticated endpoints require a JWT token sent via **cookie** (`token`) or **Authorization header** (`Bearer <token>`).

### Roles

| Role               | Description          |
| ------------------ | -------------------- |
| `ADMIN`            | Full system access   |
| `PROJECT_MANAGER`  | Manage own projects  |
| `TEAM_MEMBER`      | Assigned tasks only  |

---

## Health

### `GET /api/health`

Health check endpoint (no auth required).

**Response `200`**
```json
{ "status": "ok" }
```

---

## Auth

### `POST /api/auth/register`

Create a new user account.

**Request Body**
| Field    | Type                                   | Required | Description          |
| -------- | -------------------------------------- | -------- | -------------------- |
| name     | string (min 2)                         | yes      | Full name            |
| email    | string (email format)                  | yes      | Email address        |
| password | string (min 8)                         | yes      | Password             |
| role     | `ADMIN` \| `PROJECT_MANAGER` \| `TEAM_MEMBER` | no  | Defaults to `TEAM_MEMBER` |

**Response `201`**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "TEAM_MEMBER"
}
```

**Errors:** `400` (validation), `409` (email already registered)

---

### `POST /api/auth/login`

Authenticate and receive a JWT token.

**Request Body**
| Field    | Type   | Required |
| -------- | ------ | -------- |
| email    | string | yes      |
| password | string | yes      |

**Response `200`**
```json
{
  "token": "jwt-string",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "TEAM_MEMBER"
  }
}
```

Sets `token` as an httpOnly cookie.

**Errors:** `401` (invalid email or password)

---

## Projects

All project endpoints require authentication.

### `GET /api/projects`

List projects. Results are scoped by role:
- **ADMIN:** all projects
- **PROJECT_MANAGER:** only projects they created
- **TEAM_MEMBER:** only projects they are a member of

**Response `200`**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "status": "ACTIVE",
    "createdAt": "ISO-8601",
    "creator": { "id": "uuid", "name": "string", "email": "string" },
    "_count": { "tasks": 0, "members": 0 }
  }
]
```

---

### `GET /api/projects/:id`

Get a single project with full details.

**Response `200`**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "ACTIVE",
  "createdAt": "ISO-8601",
  "creator": { "id": "uuid", "name": "string", "email": "string" },
  "members": [
    {
      "id": "uuid",
      "user": { "id": "uuid", "name": "string", "email": "string" }
    }
  ],
  "_count": { "tasks": 0, "members": 0 }
}
```

**Errors:** `403` (insufficient permissions), `404` (not found)

---

### `POST /api/projects`

Create a project. Requires `ADMIN` or `PROJECT_MANAGER` role.

**Request Body**
| Field       | Type                  | Required | Default |
| ----------- | --------------------- | -------- | ------- |
| name        | string (1-255)        | yes      | —       |
| description | string                | no       | `""`    |

**Response `201`**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "status": "ACTIVE",
  "createdAt": "ISO-8601",
  "creatorId": "uuid"
}
```

**Errors:** `400` (validation), `403` (insufficient role)

---

### `PUT /api/projects/:id`

Update project name/description. Only the creator or an ADMIN can update.

**Request Body** (all fields optional)
| Field       | Type           | Required |
| ----------- | -------------- | -------- |
| name        | string (1-255) | no       |
| description | string         | no       |

**Response `200`** — Updated project object.

**Errors:** `403` (insufficient permissions), `404` (not found)

---

### `DELETE /api/projects/:id`

Delete a project. Only the creator or an ADMIN can delete.

**Response `204`** — No content.

**Errors:** `403` (insufficient permissions), `404` (not found)

---

### `PATCH /api/projects/:id/status`

Update project status. Only the creator or an ADMIN can update.

**Request Body**
| Field  | Type                                           | Required |
| ------ | ---------------------------------------------- | -------- |
| status | `ACTIVE` \| `COMPLETED` \| `ARCHIVED` | yes      |

**Response `200`** — Updated project object.

**Errors:** `400` (validation), `403` (insufficient permissions), `404` (not found)

---

## Tasks

All task endpoints require authentication.

### `GET /api/tasks`

Get all tasks assigned to the authenticated user.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "TODO",
    "priority": "MEDIUM",
    "dueDate": "ISO-8601",
    "createdAt": "ISO-8601",
    "assignedTo": "uuid",
    "projectId": "uuid",
    "assignee": { "id": "uuid", "name": "string", "email": "string" },
    "_count": { "comments": 0 }
  }
]
```

---

### `GET /api/tasks/projects/:projectId/tasks`

Get all tasks for a specific project. Requires membership or ADMIN role.

**Response `200`** — Array of task objects (same shape as above).

**Errors:** `403` (insufficient permissions), `404` (project not found)

---

### `POST /api/tasks/projects/:projectId/tasks`

Create a task within a project. Requires `ADMIN` or project creator (PROJECT_MANAGER).

**Request Body**
| Field       | Type                             | Required | Default    |
| ----------- | -------------------------------- | -------- | ---------- |
| title       | string (1-255)                   | yes      | —          |
| description | string                           | no       | —          |
| priority    | `LOW` \| `MEDIUM` \| `HIGH`      | no       | `MEDIUM`   |
| dueDate     | string (ISO-8601 datetime)       | yes      | —          |
| assignedTo  | string (uuid)                    | no       | —          |

If `assignedTo` is provided, the user must be a member of the project.

**Response `201`**
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "title": "string",
  "description": "string",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "ISO-8601",
  "createdAt": "ISO-8601",
  "assignedTo": "uuid",
  "assignee": { "id": "uuid", "name": "string", "email": "string" }
}
```

**Errors:** `400` (validation), `403` (insufficient permissions), `404` (project not found)

---

### `GET /api/tasks/:id`

Get a single task. Accessible to ADMIN, project creator, assignee, or project member.

**Response `200`**
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "TODO",
  "priority": "MEDIUM",
  "dueDate": "ISO-8601",
  "createdAt": "ISO-8601",
  "assignedTo": "uuid",
  "projectId": "uuid",
  "assignee": { "id": "uuid", "name": "string", "email": "string" },
  "project": {
    "id": "uuid",
    "name": "string",
    "creatorId": "uuid",
    "members": [{ "userId": "uuid" }]
  },
  "_count": { "comments": 0 }
}
```

**Errors:** `403` (insufficient permissions), `404` (not found)

---

### `PATCH /api/tasks/:id`

Update task fields. Requires `ADMIN` or project creator (PROJECT_MANAGER).

**Request Body** (all fields optional)
| Field       | Type                             | Required |
| ----------- | -------------------------------- | -------- |
| title       | string (1-255)                   | no       |
| description | string                           | no       |
| priority    | `LOW` \| `MEDIUM` \| `HIGH`      | no       |
| dueDate     | string (ISO-8601 datetime)       | no       |
| assignedTo  | string (uuid) or `null`          | no       |

**Response `200`** — Updated task object.

**Errors:** `400` (validation), `403` (insufficient permissions), `404` (not found)

---

### `PATCH /api/tasks/:id/status`

Update task status. Accessible to ADMIN, project creator, or task assignee.

**Request Body**
| Field  | Type                                             | Required |
| ------ | ------------------------------------------------ | -------- |
| status | `TODO` \| `IN_PROGRESS` \| `DONE` | yes      |

**Response `200`** — Updated task object.

**Errors:** `400` (validation), `403` (insufficient permissions), `404` (not found)

---

### `DELETE /api/tasks/:id`

Delete a task. Requires `ADMIN` or project creator (PROJECT_MANAGER).

**Response `204`** — No content.

**Errors:** `403` (insufficient permissions), `404` (not found)

---

## Comments

All comment endpoints require authentication.

### `GET /api/comments/task/:taskId`

Get all comments for a task. Accessible to ADMIN, project creator, assignee, or project member.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "comment": "string",
    "createdAt": "ISO-8601",
    "taskId": "uuid",
    "userId": "uuid",
    "user": { "id": "uuid", "name": "string", "email": "string" }
  }
]
```

**Errors:** `403` (insufficient permissions), `404` (task not found)

---

### `POST /api/comments/task/:taskId`

Add a comment to a task. Accessible to ADMIN, project creator, assignee, or project member.

**Request Body**
| Field   | Type               | Required |
| ------- | ------------------ | -------- |
| comment | string (1-2000)    | yes      |

**Response `201`**
```json
{
  "id": "uuid",
  "comment": "string",
  "createdAt": "ISO-8601",
  "taskId": "uuid",
  "userId": "uuid",
  "user": { "id": "uuid", "name": "string", "email": "string" }
}
```

**Errors:** `400` (validation), `403` (insufficient permissions), `404` (task not found)

---

## Members

All member endpoints require authentication.

### `GET /api/members/project/:projectId`

List members of a project. Accessible to ADMIN, project creator, or project member.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "joinedAt": "ISO-8601",
    "projectId": "uuid",
    "userId": "uuid",
    "user": { "id": "uuid", "name": "string", "email": "string", "role": "TEAM_MEMBER" }
  }
]
```

**Errors:** `403` (insufficient permissions), `404` (project not found)

---

### `POST /api/members/project/:projectId`

Add a member to a project. Requires `ADMIN` or project creator (PROJECT_MANAGER).

**Request Body**
| Field  | Type             | Required |
| ------ | ---------------- | -------- |
| userId | string (uuid)    | yes      |

**Response `201`**
```json
{
  "id": "uuid",
  "joinedAt": "ISO-8601",
  "projectId": "uuid",
  "userId": "uuid",
  "user": { "id": "uuid", "name": "string", "email": "string", "role": "TEAM_MEMBER" }
}
```

**Errors:** `400` (validation), `403` (insufficient permissions), `404` (user/project not found), `409` (already a member)

---

### `DELETE /api/members/project/:projectId/:userId`

Remove a member from a project. Requires `ADMIN` or project creator (PROJECT_MANAGER).

**Response `204`** — No content.

**Errors:** `403` (insufficient permissions), `404` (project or member not found)

---

## Users

All user endpoints require authentication and `ADMIN` role.

### `GET /api/users`

List all users.

**Response `200`**
```json
[
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "TEAM_MEMBER",
    "createdAt": "ISO-8601"
  }
]
```

**Errors:** `403` (insufficient role)

---

### `POST /api/users`

Create a user (admin-only version).

**Request Body**
| Field    | Type                                                     | Required |
| -------- | -------------------------------------------------------- | -------- |
| name     | string (min 2)                                           | yes      |
| email    | string (email format)                                    | yes      |
| password | string (min 8)                                           | yes      |
| role     | `ADMIN` \| `PROJECT_MANAGER` \| `TEAM_MEMBER` | yes      |

**Response `201`**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "TEAM_MEMBER",
  "createdAt": "ISO-8601"
}
```

**Errors:** `400` (validation), `403` (insufficient role), `409` (email already exists)

---

### `PATCH /api/users/:id/role`

Update a user's role.

**Request Body**
| Field | Type                                                     | Required |
| ----- | -------------------------------------------------------- | -------- |
| role  | `ADMIN` \| `PROJECT_MANAGER` \| `TEAM_MEMBER` | yes      |

**Response `200`**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "ADMIN",
  "createdAt": "ISO-8601"
}
```

**Errors:** `400` (validation), `403` (insufficient role), `404` (user not found)

---

### `DELETE /api/users/:id`

Delete a user. Cannot delete yourself.

**Response `204`** — No content.

**Errors:** `400` (cannot delete yourself), `403` (insufficient role), `404` (user not found)

---

## Error Format

All error responses follow this shape:

```json
{
  "error": "Human-readable error message"
}
```

Validation errors return:

```json
{
  "error": [
    { "code": "too_small", "message": "String must contain at least 2 character(s)", "path": ["name"] }
  ]
}
```

## Database Schema

```
User
  id            String (uuid)    PK
  name          String
  email         String           UNIQUE
  passwordHash  String
  role          Role             enum: ADMIN | PROJECT_MANAGER | TEAM_MEMBER
  createdAt     DateTime

Project
  id            String (uuid)    PK
  name          String
  description   String
  status        ProjectStatus    enum: ACTIVE | COMPLETED | ARCHIVED
  createdAt     DateTime
  creatorId     String           FK -> User.id

Task
  id            String (uuid)    PK
  projectId     String           FK -> Project.id
  title         String
  description   String?
  assignedTo    String?          FK -> User.id
  status        TaskStatus       enum: TODO | IN_PROGRESS | DONE
  priority      TaskPriority     enum: LOW | MEDIUM | HIGH
  dueDate       DateTime
  createdAt     DateTime

ProjectMember
  id            String (uuid)    PK
  projectId     String           FK -> Project.id
  userId        String           FK -> User.id
  joinedAt      DateTime
  UNIQUE(projectId, userId)

TaskComment
  id            String (uuid)    PK
  taskId        String           FK -> Task.id
  userId        String           FK -> User.id
  comment       String
  createdAt     DateTime
```
