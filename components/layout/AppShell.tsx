'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { DEMO_USERS, DemoUser } from '@/lib/demo-data';

export interface AppShellProps {
  children: React.ReactNode;
  initialRole?: 'student' | 'staff' | 'admin';
}

export const AppShell: React.FC<AppShellProps> = ({ children, initialRole = 'student' }) => {
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>(initialRole);
  const [userOverride, setUserOverride] = useState<DemoUser | null>(null);

  useEffect(() => {
    async function syncAuthUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const mappedRole = (data.user.role?.toLowerCase() || 'student') as 'student' | 'staff' | 'admin';
            setRole(mappedRole);
            setUserOverride({
              id: data.user.id,
              name: data.user.displayName,
              email: data.user.email,
              role: mappedRole,
              studentId: data.user.campusId,
              department: data.user.department || 'Campus Community',
            });
          }
        }
      } catch {
        /* silent fallback */
      }
    }
    syncAuthUser();
  }, []);

  const currentUser: DemoUser = userOverride || DEMO_USERS[role] || DEMO_USERS.student;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar currentRole={role} onRoleChange={setRole} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header user={currentUser} />

        {/* Workspace Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8 flex flex-col justify-between">
          <div>{children}</div>
          <footer className="mt-8 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-400 font-medium">
            CampusConnect • Kiro University 2026
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentRole={role} />
    </div>
  );
};
