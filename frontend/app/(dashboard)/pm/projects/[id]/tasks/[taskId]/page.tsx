'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from '@/lib/hooks/useTasks';
import { useComments, useCreateComment } from '@/lib/hooks/useComments';
import { useMembers } from '@/lib/hooks/useMembers';
import type { TaskStatus } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import CommentSection from '@/components/CommentSection';

const statusFlow: Record<string, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

const statusButtonLabel: Record<string, string> = {
  TODO: 'Start Task',
  IN_PROGRESS: 'Mark Done',
  DONE: 'Reopen',
};

export default function PMTaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = session?.user;
  const projectId = params.id as string;
  const taskId = params.taskId as string;

  const { data: task, isLoading: taskLoading, error: taskError } = useTask(taskId);
  const { data: comments = [] } = useComments(taskId);
  const { data: members = [] } = useMembers(projectId);
  const updateTask = useUpdateTask(taskId, projectId);
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask(projectId);
  const createComment = useCreateComment(taskId);

  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [editDueDate, setEditDueDate] = useState('');
  const [editAssignee, setEditAssignee] = useState('');

  useEffect(() => {
    if (taskError && (taskError as { response?: { status?: number } })?.response?.status === 404) {
      router.push('/pm/projects');
    }
  }, [taskError, router]);

  const handleStatusUpdate = async () => {
    if (!task) return;
    const newStatus = statusFlow[task.status];
    try {
      await updateTaskStatus.mutateAsync({ taskId: task.id, status: newStatus });
    } catch {
      setError('Failed to update status');
    }
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;
    try {
      const body: Record<string, unknown> = {};
      if (editTitle.trim() !== task.title) body.title = editTitle.trim();
      if (editDesc !== (task.description || '')) body.description = editDesc;
      if (editPriority !== task.priority) body.priority = editPriority;
      if (editDueDate && new Date(editDueDate).toISOString() !== task.dueDate) body.dueDate = new Date(editDueDate).toISOString();
      const newAssignee = editAssignee || null;
      if (newAssignee !== task.assignedTo) body.assignedTo = newAssignee;

      if (Object.keys(body).length === 0) {
        setShowEdit(false);
        return;
      }

      await updateTask.mutateAsync(body);
      setShowEdit(false);
    } catch {
      setError('Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!task || !confirm('Delete this task?')) return;
    try {
      await deleteTask.mutateAsync(task.id);
      router.push(`/pm/projects/${projectId}`);
    } catch {
      setError('Failed to delete task');
    }
  };

  const handleAddComment = async (_taskId: string, comment: string) => {
    await createComment.mutateAsync(comment);
  };

  if (taskLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading task...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href={`/pm/projects/${projectId}`} className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
        &larr; Back to Project
      </Link>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{task.title}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleStatusUpdate}
              disabled={updateTaskStatus.isPending}
              className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 whitespace-nowrap"
            >
              {updateTaskStatus.isPending ? '...' : statusButtonLabel[task.status]}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Assignee:</span>
            <span className="ml-1 text-zinc-800 dark:text-zinc-200">{task.assignee?.name || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Due date:</span>
            <span className="ml-1 text-zinc-800 dark:text-zinc-200">{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Created:</span>
            <span className="ml-1 text-zinc-800 dark:text-zinc-200">{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {task.description && (
          <div>
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Description</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => {
              setEditTitle(task.title);
              setEditDesc(task.description || '');
              setEditPriority(task.priority);
              setEditDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
              setEditAssignee(task.assignedTo || '');
              setShowEdit(true);
            }}
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

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <CommentSection comments={comments} taskId={taskId} onAddComment={handleAddComment} />
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form
            onSubmit={handleEdit}
            className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 w-full max-w-lg space-y-4 shadow-lg"
          >
            <h3 className="text-sm font-semibold">Edit Task</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assignee</label>
              <select
                value={editAssignee}
                onChange={(e) => setEditAssignee(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>{m.user.name}</option>
                ))}
              </select>
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
                disabled={updateTask.isPending}
                className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
              >
                {updateTask.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
