'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useProjects, useCreateProject, useDeleteProject } from '@/lib/hooks/useProjects';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  ARCHIVED: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const statusLabels: Record<string, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ARCHIVED: 'Archived',
};

export default function PMProjectsPage() {
  const { data: projects, isLoading, error: loadError } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await createProject.mutateAsync({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setShowCreate(false);
    } catch {
      setError('Failed to create project');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Delete this project? This action cannot be undone.')) return;
    try {
      await deleteProject.mutateAsync(projectId);
    } catch {
      setError('Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Projects</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your projects.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          {showCreate ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {(error || loadError) && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
          {error || 'Failed to load projects'}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold">New Project</h3>
          <div>
            <label htmlFor="project-name" className="block text-sm font-medium mb-1">Name</label>
            <input
              id="project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <div>
            <label htmlFor="project-desc" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="project-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
          <button
            type="submit"
            disabled={createProject.isPending}
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {createProject.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Tasks</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Members</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Created</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects?.map((project) => (
              <tr key={project.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3">
                  <Link href={`/pm/projects/${project.id}`} className="font-medium hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{project._count.tasks}</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{project._count.members}</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                  {new Date(project.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!projects || projects.length === 0) && (
          <p className="p-6 text-center text-zinc-500 dark:text-zinc-400">No projects found.</p>
        )}
      </div>
    </div>
  );
}
