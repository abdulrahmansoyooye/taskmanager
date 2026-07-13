'use client';

type Props = {
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
};

const styles: Record<string, string> = {
  TODO: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  DONE: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const labels: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
