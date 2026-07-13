'use client';

import { useState, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useUsers, useCreateUser, useUpdateUserRole, useDeleteUser } from '@/lib/hooks/useUsers';

const ROLES = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'] as const;

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUser = session?.user;
  const { data: users = [], isLoading, error: loadError } = useUsers();
  const createUser = useCreateUser();
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const [error, setError] = useState<string | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<string>('TEAM_MEMBER');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<string>('TEAM_MEMBER');

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createUser.mutateAsync({ name: createName, email: createEmail, password: createPassword, role: createRole });
      setShowCreate(false);
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('TEAM_MEMBER');
    } catch (err: unknown) {
      const message =
        err instanceof Object && err !== null && 'response' in err
          ? ((err as { response: { data: { error: string } } }).response.data.error || 'Failed to create user')
          : 'Failed to create user';
      setError(message);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole.mutateAsync({ userId, role });
      setEditingId(null);
    } catch (err: unknown) {
      const message =
        err instanceof Object && err !== null && 'response' in err
          ? ((err as { response: { data: { error: string } } }).response.data.error || 'Failed to update role')
          : 'Failed to update role';
      setError(message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser.mutateAsync(userId);
    } catch (err: unknown) {
      const message =
        err instanceof Object && err !== null && 'response' in err
          ? ((err as { response: { data: { error: string } } }).response.data.error || 'Failed to delete user')
          : 'Failed to delete user';
      setError(message);
    }
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      PROJECT_MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      TEAM_MEMBER: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    };
    return (
      <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${colors[role] || ''}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 dark:text-zinc-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">User Management</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Create, edit roles, and manage users.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
        >
          {showCreate ? 'Cancel' : 'Create User'}
        </button>
      </div>

      {(error || loadError) && (
        <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
          {error || 'Failed to load users'}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold">New User</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="create-name" className="block text-sm font-medium mb-1">Name</label>
              <input
                id="create-name"
                type="text"
                required
                minLength={2}
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="create-email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="create-email"
                type="email"
                required
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="create-password" className="block text-sm font-medium mb-1">Password</label>
              <input
                id="create-password"
                type="password"
                required
                minLength={8}
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </div>
            <div>
              <label htmlFor="create-role" className="block text-sm font-medium mb-1">Role</label>
              <select
                id="create-role"
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={createUser.isPending}
            className="rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {createUser.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Name</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Email</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Role</th>
              <th className="text-left px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Created</th>
              <th className="text-right px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  {editingId === u.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-400"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                      </select>
                      <button
                        onClick={() => handleRoleChange(u.id, editRole)}
                        className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-xs text-zinc-400 hover:text-zinc-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {roleBadge(u.role)}
                      <button
                        onClick={() => { setEditingId(u.id); setEditRole(u.role); }}
                        className="text-xs text-zinc-400 hover:text-zinc-600"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {currentUser?.id !== u.id && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-6 text-center text-zinc-500 dark:text-zinc-400">No users found.</p>
        )}
      </div>
    </div>
  );
}
