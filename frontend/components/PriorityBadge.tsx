'use client';

type Props = {
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
};

const styles: Record<string, string> = {
  LOW: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function PriorityBadge({ priority }: Props) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}
