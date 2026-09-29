'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  PackageSearch,
  Megaphone,
  User,
  Users,
  Building2,
  Activity,
  BarChart3,
  Bell,
  School,
  LogOut,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

export interface SidebarProps {
  userRole?: 'student' | 'staff' | 'admin';
  user?: any;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole = 'student',
  user,
  onLogout,
}) => {
  const pathname = usePathname();

  // Navigation Links tailored to Role according to Reference Image & Specs
  const studentNav = [
    { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Requests', href: '/issues', icon: ClipboardList },
    { label: 'Report Issue', href: '/issues/new', icon: PlusCircle },
    { label: 'Lost & Found', href: '/lost-found', icon: PackageSearch },
    { label: 'Campus Updates', href: '/announcements', icon: Megaphone },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const staffNav = [
    { label: 'Overview', href: '/staff', icon: LayoutDashboard },
    { label: 'My Work', href: '/staff/issues', icon: ClipboardList },
    { label: 'Alerts', href: '/notifications', icon: Bell },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Requests', href: '/admin/issues', icon: ClipboardList },
    { label: 'Staff', href: '/admin/users', icon: Users },
    { label: 'Lost & Found', href: '/admin/lost-found', icon: PackageSearch },
    { label: 'Departments', href: '/admin/departments', icon: Building2 },
    { label: 'Activity', href: '/admin/activity', icon: Activity },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Profile', href: '/admin/profile', icon: User },
  ];

  const navItems =
    userRole === 'admin' ? adminNav : userRole === 'staff' ? staffNav : studentNav;

  const displayName = user?.displayName || user?.name || (userRole === 'admin' ? 'Admin' : userRole === 'staff' ? 'Staff Member' : 'Student');
  const displayRole = userRole === 'admin' ? 'Administrator' : userRole === 'staff' ? `Staff - ${user?.department || 'Facilities'}` : 'Student';

  return (
    <aside className="w-64 bg-[#0b1727] text-slate-300 flex flex-col justify-between h-screen sticky top-0 shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md shadow-blue-500/30">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
              CampusConnect
            </h1>
            <span className="text-[10px] text-slate-400 font-medium">v2 Platform</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' &&
                item.href !== '/staff' &&
                item.href !== '/admin' &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card in Sidebar (Matching Reference Image) */}
      <div className="p-4 border-t border-slate-800/80 bg-[#08101c]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={displayName} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 truncate">{displayRole}</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Log Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
