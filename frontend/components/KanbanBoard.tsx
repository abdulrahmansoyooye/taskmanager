'use client';

import { useState } from 'react';
import type { Task } from '@/types';
import TaskCard from './TaskCard';

type Props = {
  tasks: Task[];
  onStatusChange: (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
};

const columns: { id: 'TODO' | 'IN_PROGRESS' | 'DONE'; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Done' },
];

const columnStyles: Record<string, string> = {
  TODO: 'border-t-zinc-400 dark:border-t-zinc-500',
  IN_PROGRESS: 'border-t-blue-400 dark:border-t-blue-500',
  DONE: 'border-t-green-400 dark:border-t-green-500',
};

export default function KanbanBoard({ tasks, onStatusChange }: Props) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDragEnter={() => setDragOverColumn(col.id)}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex-1 min-w-[280px] rounded-lg border border-zinc-200 dark:border-zinc-700 border-t-2 ${columnStyles[col.id]} ${isOver ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-zinc-50 dark:bg-zinc-900/50'}`}
          >
            <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{col.label}</h3>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">{columnTasks.length}</span>
              </div>
            </div>
            <div className="p-2 space-y-2 min-h-[120px]">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} onDragStart={handleDragStart} />
              ))}
              {columnTasks.length === 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-6">No tasks</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
