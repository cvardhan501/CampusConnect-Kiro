'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingState } from '@/components/ui/LoadingState';
import { Mail, Phone, Building, IdCard, Shield } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data?.user) {
          setUser({
            name: data.user.displayName || 'Campus User',
            email: data.user.email || 'Not provided',
            role: data.user.role || 'Student',
            department: data.user.department || 'Not provided',
            studentId: data.user.campusId || 'Not provided',
            phone: data.user.contactPhone || data.user.phoneNumber || 'Not provided',
            status: data.user.status || 'Active',
            createdAt: data.user.createdAt,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell initialRole={(user?.role?.toLowerCase() as any) || 'student'}>
      <div className="max-w-3xl mx-auto space-y-6 select-none">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">User Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your personal details and account preferences.</p>
        </div>

        {loading ? (
          <LoadingState message="Loading user profile..." />
        ) : !user ? (
          <div className="text-center py-12 text-xs font-semibold text-slate-400">User details unavailable.</div>
        ) : (
          <>
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <Avatar name={user.name} size="lg" className="w-20 h-20 text-xl border-2 border-blue-200" />
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900">{user.name}</h2>
                <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2563eb] border border-blue-200">
                    {user.role} Account
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {user.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0 border border-blue-100">
                  <IdCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Campus / Student ID</p>
                  <p className="text-sm font-bold text-slate-900">{user.studentId}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Department</p>
                  <p className="text-sm font-bold text-slate-900">{user.department}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Email Address</p>
                  <p className="text-sm font-bold text-slate-900">{user.email}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                  <p className="text-sm font-bold text-slate-900">{user.phone}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
