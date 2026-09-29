'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Menu } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Avatar } from '@/components/ui/Avatar';

export interface TopbarProps {
  user?: any;
  onOpenMobileNav?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ user, onOpenMobileNav }) => {
  const displayName = user?.displayName || user?.name || 'User';
  const role = user?.role || 'Student';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Mobile Menu Toggle + Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileNav && (
          <button
            onClick={onOpenMobileNav}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <SearchInput placeholder="Search requests, locations, or documents..." />
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-4 shrink-0">
        <Link
          href="/notifications"
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2563eb] ring-2 ring-white" />
        </Link>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Card */}
        <Link href="/profile" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <Avatar name={displayName} size="sm" />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-[#2563eb] border border-blue-100">
              {role}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
