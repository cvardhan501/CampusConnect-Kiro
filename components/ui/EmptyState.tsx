import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  action,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm my-4">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563eb] flex items-center justify-center mx-auto">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 font-medium">{description}</p>
      </div>
      {action ? (
        <div className="pt-2">{action}</div>
      ) : actionText && onAction ? (
        <div className="pt-2">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      ) : null}
    </div>
  );
};
