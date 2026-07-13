'use client';

import Link from 'next/link';
import type { Task } from '@/types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

type Props = {
  task: Task;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
};

export default function TaskCard({ task, onDragStart }: Props) {
  return (
    <Link href={`/member/tasks/${task.id}`}>
      <div
        draggable
        onDragStart={(e) => onDragStart?.(e, task.id)}
        className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3 hover:shadow-sm transition-shadow cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
            {task.title}
          </h3>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>{task.assignee?.name || 'Unassigned'}</span>
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
