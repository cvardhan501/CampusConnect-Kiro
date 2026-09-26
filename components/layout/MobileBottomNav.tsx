'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, PackageSearch, User } from 'lucide-react';

export interface MobileBottomNavProps {
  currentRole: 'student' | 'staff' | 'admin';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentRole }) => {
  const pathname = usePathname();

  const homeHref = currentRole === 'admin' ? '/admin' : currentRole === 'staff' ? '/staff' : '/dashboard';
  const issuesHref = currentRole === 'staff' ? '/staff/issues' : currentRole === 'admin' ? '/admin/issues' : '/issues';
  const lfHref = currentRole === 'staff' ? '/staff/lost-found' : currentRole === 'admin' ? '/admin/lost-found' : '/lost-found';

  const navItems = [
    { label: 'Home', href: homeHref, icon: Home },
    { label: 'Issues', href: issuesHref, icon: ClipboardList },
    { label: 'Lost & Found', href: lfHref, icon: PackageSearch },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 shadow-lg z-30 px-3 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && item.href !== '/staff' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#2563eb]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-[#2563eb]' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
