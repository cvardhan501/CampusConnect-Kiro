'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/Button';
import { Building2, Plus, Wrench, Snowflake, Wifi, Droplet, Zap, Shield } from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDepts() {
      try {
        const res = await fetch('/api/admin/departments', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setDepartments(data.departments || []);
        }
      } catch (err) {
        console.error('Failed to load departments:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDepts();
  }, []);

  const getDeptIcon = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes('facilities')) return <Snowflake className="w-4 h-4 text-[#2563eb]" />;
    if (norm.includes('it') || norm.includes('wifi')) return <Wifi className="w-4 h-4 text-indigo-600" />;
    if (norm.includes('maintenance')) return <Wrench className="w-4 h-4 text-amber-600" />;
    if (norm.includes('electrical')) return <Zap className="w-4 h-4 text-purple-600" />;
    if (norm.includes('plumbing')) return <Droplet className="w-4 h-4 text-teal-600" />;
    return <Shield className="w-4 h-4 text-slate-600" />;
  };

  const columns: Column<any>[] = [
    {
      header: 'Department',
      cell: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            {getDeptIcon(d.name)}
          </div>
          <span className="font-bold text-slate-900">{d.name}</span>
        </div>
      ),
    },
    {
      header: 'Head',
      accessorKey: 'headName',
      cell: (d) => <span className="font-semibold text-slate-700">{d.headName}</span>,
    },
    {
      header: 'Active Requests',
      cell: (d) => (
        <span className="font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563eb] text-xs">
          {d.activeRequests || 0}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (d) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          {d.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: () => (
        <Button size="sm" variant="outline">
          View
        </Button>
      ),
    },
  ];

  return (
    <AppShell initialRole="admin">
      <div className="space-y-6 select-none">
        {/* Header (Matching Screen #12) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Departments</h1>
            <p className="text-sm text-slate-500 font-medium">Manage campus departments and services.</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />}>+ Add Department</Button>
        </div>

        {/* Content Container (Matching Screen #12) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          {loading ? (
            <div className="text-center text-xs text-slate-400 py-8 font-semibold">Loading departments...</div>
          ) : (
            <DataTable
              columns={columns}
              data={departments}
              keyExtractor={(d) => d.id || d._id}
              emptyMessage="No departments configured."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
