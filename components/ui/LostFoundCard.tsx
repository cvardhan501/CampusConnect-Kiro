import React from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { DemoLostFoundItem } from '@/lib/demo-data';

export interface LostFoundCardProps {
  item: DemoLostFoundItem;
}

export const LostFoundCard: React.FC<LostFoundCardProps> = ({ item }) => {
  return (
    <Link
      href={`/lost-found/${item.id}`}
      className="group block bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-blue-300 hover:shadow transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-500 font-bold text-sm">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-[#2563eb] transition-colors">
              {item.name}
            </h4>
            <p className="text-xs text-slate-500 font-medium truncate">
              <span className={item.type === 'Lost' ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                {item.type}
              </span>{' '}
              • {item.location}
            </p>
            <p className="text-[11px] text-slate-400 font-medium sm:hidden mt-0.5">{item.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">{item.date}</span>
          <StatusBadge status={item.status} />
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#2563eb] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
};
