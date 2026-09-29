'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

export interface AppShellProps {
  children: React.ReactNode;
  initialRole?: 'student' | 'staff' | 'admin';
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function syncAuthUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        if (!data.user) {
          router.push('/login');
          return;
        }

        const rawRole = (data.user.role || 'Student').toLowerCase();
        const mappedRole: 'student' | 'staff' | 'admin' =
          rawRole === 'administrator' || rawRole === 'admin'
            ? 'admin'
            : rawRole === 'staff'
            ? 'staff'
            : 'student';

        // Check page authorization
        if (pathname.startsWith('/admin') && mappedRole !== 'admin') {
          router.push('/dashboard');
          return;
        }

        if (pathname.startsWith('/staff') && mappedRole !== 'staff' && mappedRole !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setRole(mappedRole);
        setAuthUser({
          id: data.user.id,
          name: data.user.displayName,
          email: data.user.email,
          role: mappedRole,
          studentId: data.user.campusId,
          department: data.user.department || 'Not provided',
          phoneNumber: data.user.phoneNumber || 'Not provided',
        });
        setAuthorized(true);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    syncAuthUser();
  }, [pathname, router]);

  if (loading || !authorized || !authUser) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-sm font-medium">
        Loading CampusConnect...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar currentRole={role} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header user={authUser} />

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
