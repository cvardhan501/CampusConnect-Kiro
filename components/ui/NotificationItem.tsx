import React from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Bell } from 'lucide-react';
import { DemoNotification } from '@/lib/demo-data';

export interface NotificationItemProps {
  notification: DemoNotification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'issue':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'claim':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'issue':
        return 'bg-emerald-50';
      case 'claim':
        return 'bg-blue-50';
      default:
        return 'bg-amber-50';
    }
  };

  const content = (
    <div
      className={`rounded-2xl border p-4 flex items-start gap-4 transition-all ${
        notification.read
          ? 'bg-white border-slate-200/80'
          : 'bg-blue-50/50 border-blue-200 shadow-sm'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(notification.type)}`}>
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900">{notification.title}</h4>
          <span className="text-xs text-slate-400 font-medium shrink-0">{notification.timestamp}</span>
        </div>
        <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{notification.message}</p>
      </div>
    </div>
  );

  if (notification.link) {
    return <Link href={notification.link}>{content}</Link>;
  }

  return content;
};
