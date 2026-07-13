'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const features = [
  {
    title: 'Admin',
    role: 'ADMIN',
    description: 'Oversee the entire system. Manage users and roles, view all projects and tasks across the organization.',
    items: ['User management', 'Role assignment', 'System-wide oversight', 'Project monitoring'],
  },
  {
    title: 'Project Manager',
    role: 'PROJECT_MANAGER',
    description: 'Create and manage projects. Build teams, assign tasks, and track progress with a Kanban board.',
    items: ['Project creation', 'Team management', 'Task assignment', 'Kanban workflow'],
  },
  {
    title: 'Team Member',
    role: 'TEAM_MEMBER',
    description: 'Focus on your assigned work. Update task status, add comments, and stay in sync with your team.',
    items: ['Task dashboard', 'Status updates', 'Comments & notes', 'Project context'],
  },
];

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession();

  if (session?.user) {
    const role = session.user.role;
    if (role === 'ADMIN') router.replace('/admin');
    else if (role === 'PROJECT_MANAGER') router.replace('/pm');
    else router.replace('/member');
  }

  if (session?.user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
          <h1 className="text-lg font-semibold tracking-tight">TaskManager</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              Get started
            </Link>
        </div>
        </div>
      </header>

      <main className="flex-1">
          <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
              Task management for every role
            </h2>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              A platform built for the way your team works. Admins govern, managers coordinate, and
              team members execute — all in one place.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-6 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                Create your account
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-zinc-300 dark:border-zinc-700 px-6 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Sign in
              </Link>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.role}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col"
                >
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {f.description}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                    {f.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
          <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-zinc-400">
            TaskManager
          </div>
        </footer>
      </div>
  );
}