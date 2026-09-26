'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Mail, Phone, Shield, Building, IdCard } from 'lucide-react';
import { DEMO_USERS } from '@/lib/demo-data';

export default function ProfilePage() {
  const user = DEMO_USERS.student;

  return (
    <AppShell initialRole="student">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">User Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your personal details and preferences.</p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <Avatar name={user.name} size="lg" className="w-20 h-20 text-xl border-2 border-blue-200" />
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500 font-medium">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563eb] border border-blue-200 capitalize">
              {user.role} Account
            </span>
          </div>
        </div>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
              <IdCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Student / Staff ID</p>
              <p className="text-sm font-bold text-slate-900">{user.studentId || 'CC-9901'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Department</p>
              <p className="text-sm font-bold text-slate-900">{user.department}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Email Address</p>
              <p className="text-sm font-bold text-slate-900">{user.email}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Phone Number</p>
              <p className="text-sm font-bold text-slate-900">{user.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
