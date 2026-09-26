import React from 'react';

export interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  imageUrl?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', imageUrl, className = '' }) => {
  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.substring(0, 2).toUpperCase();
  };

  const sizeMap = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${sizeMap[size]} rounded-full object-cover border border-slate-200 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-blue-100 text-[#2563eb] font-bold flex items-center justify-center border border-blue-200 shrink-0 ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
