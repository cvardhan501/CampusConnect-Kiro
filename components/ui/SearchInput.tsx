import React from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search requests...',
  className = '',
  ...props
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`} role="search">
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={props['aria-label'] || placeholder}
        className="w-full pl-10 pr-4 py-2 text-xs font-medium bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
        {...props}
      />
    </div>
  );
};
