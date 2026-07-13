'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTask, useUpdateTaskStatus } from '@/lib/hooks/useTasks';
import { useComments, useCreateComment } from '@/lib/hooks/useComments';
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

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const { data: task, isLoading, error } = useTask(taskId);
  const { data: comments = [] } = useComments(taskId);
  const updateTaskStatus = useUpdateTaskStatus();
  const createComment = useCreateComment(taskId);

  useEffect(() => {
    if (error && (error as { response?: { status?: number } })?.response?.status === 404) {
      router.push('/member');
    }
  }, [error, router]);

  const handleStatusUpdate = async () => {
    if (!task) return;
    const newStatus = statusFlow[task.status];
    await updateTaskStatus.mutateAsync({ taskId: task.id, status: newStatus });
  };

  const handleAddComment = async (_taskId: string, comment: string) => {
    await createComment.mutateAsync(comment);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading task...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load task
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/member" className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200">
        &larr; Back to Dashboard
      </Link>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">{task.title}</h2>
          <button
            onClick={handleStatusUpdate}
            disabled={updateTaskStatus.isPending}
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 whitespace-nowrap"
          >
            {updateTaskStatus.isPending ? '...' : statusButtonLabel[task.status]}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400">Project:</span>
            <Link href={`/member/projects/${task.projectId}`} className="ml-1 text-zinc-800 dark:text-zinc-200 hover:underline">
              {task.project?.name || '—'}
            </Link>
          </div>
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
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
        <CommentSection comments={comments} taskId={taskId} onAddComment={handleAddComment} />
      </div>
    </div>
  );
}
