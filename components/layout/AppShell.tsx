'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LoadingState } from '@/components/ui/LoadingState';

export interface AppShellProps {
  children: React.ReactNode;
  initialRole?: 'student' | 'staff' | 'admin';
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

        // Check route authorization
        if (pathname.startsWith('/admin') && mappedRole !== 'admin') {
          router.push('/dashboard');
          return;
        }

        if (pathname.startsWith('/staff') && mappedRole !== 'staff' && mappedRole !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setRole(mappedRole);
        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    syncAuthUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // silent
    } finally {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <LoadingState message="Loading CampusConnect v2..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar userRole={role} user={user} onLogout={handleLogout} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar userRole={role} user={user} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">{children}</main>
      </div>
    </div>
  );
};
