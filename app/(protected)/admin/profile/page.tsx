'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Shield, Key, Lock, Mail, Phone, Building } from 'lucide-react';

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data?.user) {
          setUser({
            name: data.user.displayName || 'Administrator',
            email: data.user.email || 'admin@campusconnect.local',
            role: data.user.role || 'Administrator',
            department: data.user.department || 'Administration',
            phone: data.user.contactPhone || data.user.phoneNumber || '+1 987 654 3210',
            lastLogin: new Date().toLocaleString(),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell initialRole="admin">
      <div className="max-w-3xl mx-auto space-y-6 select-none">
        {/* Header (Matching Screen #15) */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your account settings.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs font-semibold text-slate-400">Loading admin profile...</div>
        ) : (
          <div className="space-y-6">
            {/* Admin Profile Card (Matching Screen #15) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
              <div className="flex items-center gap-6">
                <Avatar name={user?.name} size="lg" className="w-20 h-20 text-2xl border-2 border-blue-200" />
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">{user?.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Role:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.role}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Department:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Last Login:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.lastLogin}</p>
                </div>
              </div>
            </div>

            {/* Security Section (Matching Screen #15) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Security</h3>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-[#2563eb]" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Change Password</p>
                    <p className="text-[10px] text-slate-500 font-medium">Update your account password</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Update
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Two-factor authentication</p>
                    <p className="text-[10px] text-slate-500 font-medium">Enhanced account protection</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
