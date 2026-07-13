'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAssignedTasks } from '@/lib/hooks/useTasks';
import { useProject } from '@/lib/hooks/useProjects';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projLoading, error: projError } = useProject(projectId);
  const { data: allTasks = [] } = useAssignedTasks();

  const tasks = allTasks.filter((t) => t.projectId === projectId);

  if (projLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading project...</p>
      </div>
    );
  }

  if (projError) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load project
      </div>
    );
  }

  if (!project) return null;

  const projectStatusLabel: Record<string, string> = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    ARCHIVED: 'Archived',
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/member" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
        &larr; Back to Dashboard
      </Link>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Created by {project.creator?.name || '—'} &middot; {projectStatusLabel[project.status]}
            </p>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        )}

        {project.members && project.members.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Members</h3>
            <div className="flex flex-wrap gap-2">
              {project.members.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {m.user.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Tasks</h3>
          {tasks.map((task) => (
            <Link key={task.id} href={`/member/tasks/${task.id}`}>
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{task.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {task.assignee?.name || 'Unassigned'} &middot; {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks in this project.</p>
      )}
    </div>
  );
}
