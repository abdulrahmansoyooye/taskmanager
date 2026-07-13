'use client';

import { useState } from 'react';
import type { Comment } from '@/types';

type Props = {
  comments: Comment[];
  taskId: string;
  onAddComment: (taskId: string, comment: string) => Promise<void>;
};

export default function CommentSection({ comments, taskId, onAddComment }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAddComment(taskId, text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Comments</h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
        >
          {submitting ? '...' : 'Send'}
        </button>
      </form>

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{c.user.name}</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{c.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
