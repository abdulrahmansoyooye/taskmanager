'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const pmNavItems = [
  { href: '/pm', label: 'Dashboard' },
  { href: '/pm/projects', label: 'Projects' },
];

const memberNavItems = [
  { href: '/member', label: 'My Tasks' },
  { href: '/member/projects', label: 'My Projects' },
];

const adminNavItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  let navItems = memberNavItems;
  if (session?.user?.role === 'ADMIN') navItems = adminNavItems;
  else if (session?.user?.role === 'PROJECT_MANAGER') navItems = pmNavItems;

  return (
    <aside className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black flex-shrink-0">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href === '/member/projects' ? `/member/projects/${session?.user.id}`:item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}