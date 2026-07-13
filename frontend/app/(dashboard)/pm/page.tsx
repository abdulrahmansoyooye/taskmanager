'use client';

import Link from 'next/link';
import { useProjects } from '@/lib/hooks/useProjects';

export default function PMDashboard() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load dashboard
      </div>
    );
  }

  const activeProjects = projects?.filter((p) => p.status === 'ACTIVE') || [];
  const completedProjects = projects?.filter((p) => p.status === 'COMPLETED') || [];
  const totalTasks = projects?.reduce((sum, p) => sum + p._count.tasks, 0) || 0;
  const totalMembers = projects?.reduce((sum, p) => sum + p._count.members, 0) || 0;

  const stats = [
    { label: 'Total Projects', value: projects?.length || 0 },
    { label: 'Active', value: activeProjects.length },
    { label: 'Completed', value: completedProjects.length },
    { label: 'Total Tasks', value: totalTasks },
    { label: 'Team Members', value: totalMembers },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">PM Dashboard</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Overview of your projects.
          </p>
        </div>
        <Link
          href="/pm/projects"
          className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          View Projects
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
            <p className="text-3xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {activeProjects.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Active Projects</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <Link key={project.id} href={`/pm/projects/${project.id}`}>
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 hover:shadow-sm transition-shadow">
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{project.name}</h4>
                  {project.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{project.description}</p>
                  )}
                  <div className="flex gap-3 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{project._count.tasks} tasks</span>
                    <span>{project._count.members} members</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(!projects || projects.length === 0) && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
          <p className="text-zinc-500 dark:text-zinc-400 mb-4">No projects yet.</p>
          <Link
            href="/pm/projects"
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900"
          >
            Create Your First Project
          </Link>
        </div>
      )}
    </div>
  );
}
