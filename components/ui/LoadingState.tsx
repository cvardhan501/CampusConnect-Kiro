import React from 'react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="py-12 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 border-3 border-blue-200 border-t-[#2563eb] rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500">{message}</p>
    </div>
  );
};
