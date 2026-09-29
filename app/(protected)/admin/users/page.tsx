'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = () => {
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => {
        const mapped = (data.users || []).map((u: any) => ({
          id: u._id || u.id,
          name: u.displayName || u.name || 'User',
          email: u.email,
          role: (u.role || 'Student').toLowerCase(),
          department: u.department || 'N/A',
          studentId: u.campusId || u.studentId || 'N/A',
        }));
        setUsers(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'student' | 'staff' | 'admin') => {
    try {
      const roleMap: Record<string, string> = {
        student: 'Student',
        staff: 'Staff',
        admin: 'Administrator',
      };
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: roleMap[newRole] }),
      });
      fetchUsers();
    } catch {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<any>[] = [
    {
      header: 'User',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="md" />
          <div>
            <span className="block font-bold text-slate-900 text-xs">{user.name}</span>
            <span className="block text-[11px] text-slate-500">{user.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department / ID',
      cell: (user) => (
        <div>
          <span className="block font-medium text-xs text-slate-800">{user.department || 'N/A'}</span>
          <span className="block text-[10px] text-slate-400">{user.studentId || 'Staff'}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (user) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 capitalize"
        >
          <option value="student">Student</option>
          <option value="staff">Staff</option>
          <option value="admin">Administrator</option>
        </select>
      ),
    },
    {
      header: 'Status',
      cell: () => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
          Active
        </span>
      ),
    },
    {
      header: 'Action',
      cell: () => (
        <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:bg-red-50">
          Deactivate
        </Button>
      ),
    },
  ];

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">User & Role Management</h1>
          <p className="text-sm text-slate-500 font-medium">Manage user accounts, assign staff permissions, and update roles.</p>
        </div>

        <div className="space-y-4">
          <SearchInput
            placeholder="Search users by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {loading ? (
            <div className="text-center py-12 text-sm text-slate-500">Loading user list...</div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No Users Found"
              description="No registered user accounts matched your search criteria."
            />
          ) : (
            <DataTable columns={columns} data={filteredUsers} />
          )}
        </div>
      </div>
    </AppShell>
  );
}

