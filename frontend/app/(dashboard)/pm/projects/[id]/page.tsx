'use client';

import { useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useProject, useUpdateProject, useUpdateProjectStatus, useDeleteProject } from '@/lib/hooks/useProjects';
import { useMembers, useAddMember, useRemoveMember } from '@/lib/hooks/useMembers';
import { useTasks, useCreateTask, useUpdateTaskStatus, useDeleteTask } from '@/lib/hooks/useTasks';
import { useUsers } from '@/lib/hooks/useUsers';
import type { User } from '@/types';
import KanbanBoard from '@/components/KanbanBoard';

export default function PMProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user;
  const projectId = params.id as string;

  const { data: project, isLoading: projLoading, error: projError } = useProject(projectId);
  const { data: members, isLoading: membersLoading } = useMembers(projectId);
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(projectId);
  const updateProject = useUpdateProject(projectId);
  const updateStatus = useUpdateProjectStatus(projectId);
  const deleteProject = useDeleteProject();
  const createTask = useCreateTask(projectId);
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask(projectId);
  const addMember = useAddMember(projectId);
  const removeMember = useRemoveMember(projectId);

  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberId, setAddMemberId] = useState('');
  const { data: allUsers } = useUsers('TEAM_MEMBER');

  const handleStatusChange = async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await updateTaskStatus.mutateAsync({ taskId, status });
    } catch {
      setError('Failed to update task status');
    }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateProject.mutateAsync({ name: editName.trim(), description: editDescription.trim() });
      setShowEdit(false);
    } catch {
      setError('Failed to update project');
    }
  };

  const handleStatusUpdate = async (status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED') => {
    try {
      await updateStatus.mutateAsync(status);
    } catch {
      setError('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project permanently?')) return;
    try {
      await deleteProject.mutateAsync(projectId);
      router.push('/pm/projects');
    } catch {
      setError('Failed to delete project');
    }
  };

  const handleCreateTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      const body: Record<string, unknown> = {
        title: taskTitle.trim(),
        priority: taskPriority,
        dueDate: new Date(taskDueDate).toISOString(),
      };
      if (taskDesc.trim()) body.description = taskDesc.trim();
      if (taskAssignee) body.assignedTo = taskAssignee;

      await createTask.mutateAsync(body as Parameters<typeof createTask.mutateAsync>[0]);
      setShowCreateTask(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('MEDIUM');
      setTaskDueDate('');
      setTaskAssignee('');
    } catch {
      setError('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask.mutateAsync(taskId);
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleAddMember = async () => {
    if (!addMemberId) return;
    try {
      await addMember.mutateAsync(addMemberId);
      setAddMemberId('');
      setShowAddMember(false);
    } catch (err: unknown) {
      const message =
        err instanceof Object && err !== null && 'response' in err
          ? ((err as { response: { data: { error: string } } }).response.data.error || 'Failed to add member')
          : 'Failed to add member';
      setError(message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member from the project?')) return;
    try {
      await removeMember.mutateAsync(userId);
    } catch {
      setError('Failed to remove member');
    }
  };

  if (projLoading || tasksLoading) {
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

  if (!project) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        Project not found
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDueDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <Link href="/pm/projects" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
        &larr; Back to Projects
      </Link>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-medium hover:underline">Dismiss</button>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold tracking-tight">{project.name}</h2>
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                project.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Created by {project.creator?.name || '—'} on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setEditName(project.name); setEditDescription(project.description); setShowEdit(true); }}
              className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-md border border-red-300 dark:border-red-800 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Delete
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {project.status === 'ACTIVE' && (
            <button onClick={() => handleStatusUpdate('COMPLETED')} className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800">
              Mark Completed
            </button>
          )}
          {project.status !== 'ARCHIVED' && (
            <button onClick={() => handleStatusUpdate('ARCHIVED')} className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800">
              Archive
            </button>
          )}
          {project.status !== 'ACTIVE' && (
            <button onClick={() => handleStatusUpdate('ACTIVE')} className="rounded-md border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800">
              Reopen
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Members ({members?.length || 0})
          </h3>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            {showAddMember ? 'Cancel' : 'Add Member'}
          </button>
        </div>

        {showAddMember && (
          <div className="flex gap-2">
            <select
              value={addMemberId}
              onChange={(e) => setAddMemberId(e.target.value)}
              className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <option value="">Select a team member...</option>
              {allUsers
                ?.filter((u) => !members?.some((m) => m.userId === u.id))
                .map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
            </select>
            <button
              onClick={handleAddMember}
              disabled={!addMemberId || addMember.isPending}
              className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              {addMember.isPending ? '...' : 'Add'}
            </button>
          </div>
        )}

        {members && members.length > 0 ? (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{m.user.name}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.user.email}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">({m.user.role.replace('_', ' ')})</span>
                </div>
                <button
                  onClick={() => handleRemoveMember(m.userId)}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No members yet.</p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Tasks ({tasks.length})
          </h3>
          <button
            onClick={() => { setShowCreateTask(!showCreateTask); if (!taskDueDate) setTaskDueDate(defaultDueDate); }}
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            {showCreateTask ? 'Cancel' : 'New Task'}
          </button>
        </div>

        {showCreateTask && (
          <form onSubmit={handleCreateTask} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Assignee</label>
                <select
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="">Unassigned</option>
                  {members?.map((m) => (
                    <option key={m.userId} value={m.userId}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createTask.isPending}
                className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
              >
                {createTask.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        )}

        {tasks.length > 0 ? (
          <div>
            <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">All Tasks</h4>
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-md bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                  <Link href={`/pm/projects/${projectId}/tasks/${task.id}`} className="text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:underline flex-1">
                    {task.title}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{task.assignee?.name || 'Unassigned'}</span>
                    <span className={task.priority === 'HIGH' ? 'text-red-500' : task.priority === 'MEDIUM' ? 'text-amber-500' : ''}>
                      {task.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">No tasks yet. Create one to get started.</p>
        )}
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleEdit}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 w-full max-w-md space-y-4 shadow-lg"
          >
            <h3 className="text-sm font-semibold">Edit Project</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="rounded-md border border-zinc-300 dark:border-zinc-600 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProject.isPending}
                className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
              >
                {updateProject.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
