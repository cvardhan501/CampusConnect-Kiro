import React from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  className = '',
  onChange,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:border-[#2563eb] focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${className}`}
        {...props}
      />
    </div>
  );
};
