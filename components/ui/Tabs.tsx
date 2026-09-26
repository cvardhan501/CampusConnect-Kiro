import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  badgeCount?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'underlined' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underlined',
  className = '',
}) => {
  if (variant === 'segmented') {
    return (
      <div className={`p-1 bg-slate-100 rounded-xl flex items-center gap-1 ${className}`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-[#2563eb] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
              {tab.badgeCount !== undefined && (
                <span
                  className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-blue-100 text-[#2563eb]' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underlined variant (My Issues, Lost & Found reference screens)
  return (
    <div className={`border-b border-slate-200 flex items-center gap-6 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-sm font-bold transition-all whitespace-nowrap relative ${
              isActive ? 'text-[#2563eb]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
            {tab.badgeCount !== undefined && (
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-blue-50 text-[#2563eb]' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.badgeCount}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563eb] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
