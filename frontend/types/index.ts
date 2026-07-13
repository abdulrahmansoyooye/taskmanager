export type Role = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  creatorId: string;
  creator: Pick<User, "id" | "name" | "email">;
  _count: { tasks: number; members: number };
};

export type ProjectDetail = Project & {
  members: { id: string; userId: string; user: Pick<User, "id" | "name" | "email"> }[];
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  assignedTo: string | null;
  assignee: Pick<User, "id" | "name" | "email"> | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  _count: { comments: number };
};

export type Comment = {
  id: string;
  taskId: string;
  userId: string;
  user: Pick<User, "id" | "name" | "email">;
  comment: string;
  createdAt: string;
};

export type TaskDetail = Task & {
  project: Pick<Project, "id" | "name">;
};
