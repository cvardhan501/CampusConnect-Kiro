'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FilePlus2,
  PackageSearch,
  ClipboardList,
  Bell,
  User,
  CheckSquare,
  ShieldCheck,
  Users,
  BarChart3,
  Sparkles,
  History,
  FileText,
  School,
} from 'lucide-react';

export interface SidebarProps {
  currentRole: 'student' | 'staff' | 'admin';
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  hasBadge?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole }) => {
  const pathname = usePathname();

  const studentNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Report Issue', href: '/issues/new', icon: FilePlus2 },
    { label: 'Lost & Found', href: '/lost-found', icon: PackageSearch },
    { label: 'My Issues', href: '/issues', icon: ClipboardList },
    { label: 'Notifications', href: '/notifications', icon: Bell, hasBadge: true },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const staffNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
    { label: 'Assigned Issues', href: '/staff/issues', icon: CheckSquare },
    { label: 'Lost & Found', href: '/staff/lost-found', icon: PackageSearch },
    { label: 'Claims', href: '/staff/claims', icon: ShieldCheck },
    { label: 'Notifications', href: '/notifications', icon: Bell, hasBadge: true },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Issues', href: '/admin/issues', icon: ClipboardList },
    { label: 'Lost & Found', href: '/admin/lost-found', icon: PackageSearch },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'AI Insights', href: '/admin/ai-insights', icon: Sparkles },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
    { label: 'Reports', href: '/admin/reports', icon: FileText },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const navItems =
    currentRole === 'admin' ? adminNavItems : currentRole === 'staff' ? staffNavItems : studentNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 hidden md:flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          <School className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <span className="font-extrabold text-[#0f172a] text-base tracking-tight block">CampusConnect</span>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/staff' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                isActive
                  ? 'bg-blue-50 text-[#2563eb]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2563eb]' : 'text-slate-400'}`} />
              <span className="flex-1">{item.label}</span>
              {item.hasBadge && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
};
