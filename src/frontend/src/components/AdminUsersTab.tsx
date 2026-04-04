import React, { useEffect, useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { User, CurrentUser, UserRole } from '../types';
import { useLanguage } from '../i18n/context';

interface Props {
  authHeaders: () => Record<string, string>;
  currentUser: CurrentUser | null;
}

const roleBadgeStyle: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  foodvendor: 'bg-blue-100 text-blue-700',
  user: 'bg-green-100 text-green-700',
};

export default function AdminUsersTab({ authHeaders, currentUser }: Props) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users', { headers: authHeaders() })
      .then(res => res.json())
      .then(data => setUsers(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm(t.deleteUserConfirm)) return;
    await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t.usersHeading}</h2>
        <button onClick={fetchUsers} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user.username}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={user.role}
                disabled={user.username === currentUser?.username}
                onChange={e => handleRoleChange(user.id, e.target.value)}
                className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${roleBadgeStyle[user.role]}`}
              >
                <option value="user">{t.roleUser}</option>
                <option value="foodvendor">{t.roleVendor}</option>
                <option value="admin">{t.roleAdmin}</option>
              </select>
              <button
                onClick={() => handleDelete(user.id)}
                disabled={user.username === currentUser?.username}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
