'use client';

import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers();
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();

  if (usersLoading || projectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  if (usersError || projectsError) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load dashboard
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: users?.length || 0 },
    { label: 'Total Projects', value: projects?.length || 0 },
    { label: 'Admins', value: users?.filter((u) => u.role === 'ADMIN').length || 0 },
    { label: 'Project Managers', value: users?.filter((u) => u.role === 'PROJECT_MANAGER').length || 0 },
    { label: 'Team Members', value: users?.filter((u) => u.role === 'TEAM_MEMBER').length || 0 },
    { label: 'Active Projects', value: projects?.filter((p) => p.status === 'ACTIVE').length || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Admin Dashboard</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          System overview and statistics.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
            <p className="text-3xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
