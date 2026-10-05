'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, Users } from 'lucide-react';

export default function AdminStaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Facilities');
  const [password, setPassword] = useState('Staff@123456');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch('/api/admin/users?role=Staff', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setStaffList(data.users || []);
        }
      } catch (err) {
        console.error('Failed to load staff list:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStaff();
  }, []);

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const campusId = `STF-${Date.now().toString().slice(-5)}`;
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email,
          password,
          campusId,
          role: 'Staff',
          department,
        }),
      });

      if (res.ok) {
        setAddModalOpen(false);
        setDisplayName('');
        setEmail('');
        // Reload list
        const reloadRes = await fetch('/api/admin/users?role=Staff', { cache: 'no-store' });
        if (reloadRes.ok) {
          const data = await reloadRes.json();
          setStaffList(data.users || []);
        }
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);

  const handleViewUser = (u: any) => {
    setSelectedUser(null);
    setTimeout(() => {
      setSelectedUser(u);
      setViewUserModalOpen(true);
    }, 0);
  };

  const columns: Column<any>[] = [
    {
      header: 'Staff Member',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.displayName} size="sm" />
          <div>
            <p className="font-bold text-slate-900">{u.displayName}</p>
            <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessorKey: 'department',
      cell: (u) => <span className="font-semibold text-slate-700">{u.department || 'Facilities'}</span>,
    },
    {
      header: 'Active Tasks',
      cell: (u) => (
        <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb] text-xs">
          {u.activeTasks || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (u) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {u.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (u) => (
        <Button size="sm" variant="outline" onClick={() => handleViewUser(u)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6 select-none">
        {/* Header (Matching Screen #10) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Staff Management</h1>
            <p className="text-sm text-slate-500 font-medium">Manage campus staff and their workload.</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
            + Add Staff
          </Button>
        </div>

        {/* Content Container (Matching Screen #10) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          {loading ? (
            <div className="text-center text-xs text-slate-400 py-8 font-semibold">Loading staff records...</div>
          ) : (
            <DataTable
              columns={columns}
              data={staffList}
              keyExtractor={(u) => u.id || u._id}
              emptyMessage="No staff members registered."
            />
          )}
        </div>

        {/* Add Staff Modal */}
        <Modal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="Add New Staff Member"
          subtitle="Provision a staff account for department request handling."
        >
          <form onSubmit={handleAddStaffSubmit} className="space-y-4">
            <Input
              label="Staff Full Name"
              placeholder="e.g. Sarah Johnson"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

            <Input
              label="Staff Email"
              type="email"
              placeholder="e.g. sarah@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Select
              label="Department"
              options={[
                { label: 'Facilities', value: 'Facilities' },
                { label: 'IT Support', value: 'IT Support' },
                { label: 'Maintenance', value: 'Maintenance' },
                { label: 'Electrical', value: 'Electrical' },
                { label: 'Plumbing', value: 'Plumbing' },
              ]}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />

            <Input
              label="Temporary Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Provision Staff
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Staff User Modal */}
        <Modal
          isOpen={viewUserModalOpen}
          onClose={() => setViewUserModalOpen(false)}
          title="Staff Member Profile"
          subtitle={selectedUser ? `${selectedUser.displayName} (${selectedUser.campusId || 'Staff'})` : ''}
        >
          {selectedUser && (
            <div className="space-y-4 text-xs select-none">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-3">
                <Avatar name={selectedUser.displayName} size="md" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedUser.displayName}</h4>
                  <p className="text-slate-500 font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-slate-400 font-medium block">Department:</span>
                  <span className="font-bold text-slate-900">{selectedUser.department || 'Facilities'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Role:</span>
                  <span className="font-bold text-slate-900">{selectedUser.role}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Campus ID:</span>
                  <span className="font-bold font-mono text-slate-900">{selectedUser.campusId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Active Tasks:</span>
                  <span className="font-bold text-[#2563eb]">{selectedUser.activeTasks || 0} active</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Status:</span>
                  <span className="font-bold text-emerald-700">{selectedUser.status || 'Active'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Contact Phone:</span>
                  <span className="font-bold text-slate-900">{selectedUser.phoneNumber || selectedUser.contactPhone || 'N/A'}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button variant="outline" onClick={() => setViewUserModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppShell>
  );
}
