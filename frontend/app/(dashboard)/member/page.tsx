'use client';

import { useAssignedTasks, useUpdateTaskStatus } from '@/lib/hooks/useTasks';
import type { TaskStatus } from '@/types';
import KanbanBoard from '@/components/KanbanBoard';

export default function MemberDashboard() {
  const { data: tasks = [], isLoading, error } = useAssignedTasks();
  const updateTaskStatus = useUpdateTaskStatus();

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    await updateTaskStatus.mutateAsync({ taskId, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
        Failed to load tasks
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">My Tasks</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Drag and drop tasks between columns to update status.
        </p>
      </div>
      {tasks.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">No tasks assigned to you yet.</p>
      ) : (
        <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
