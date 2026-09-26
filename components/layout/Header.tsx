'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchInput } from '../ui/SearchInput';
import { Avatar } from '../ui/Avatar';
import { Bell, LogOut, School } from 'lucide-react';
import { DemoUser } from '@/lib/demo-data';

export interface HeaderProps {
  user: DemoUser;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Branding (hidden on desktop) */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shrink-0">
          <School className="w-4 h-4" />
        </div>
        <span className="font-extrabold text-[#0f172a] text-sm tracking-tight">CampusConnect</span>
      </div>

      {/* Search Bar (Desktop) */}
      <div className="hidden md:block max-w-md w-full">
        <SearchInput placeholder="Search issues, lost items, announcements..." />
      </div>

      {/* Right User & Actions Area */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon Button */}
        <Link
          href="/notifications"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </Link>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Info & Avatar */}
        <Link href="/profile" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <Avatar name={user.name} size="md" />
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
            <span className="block text-[10px] font-medium text-slate-500 capitalize">{user.role}</span>
          </div>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
