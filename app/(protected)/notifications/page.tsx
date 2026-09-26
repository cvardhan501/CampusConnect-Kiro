'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { NotificationItem } from '@/components/ui/NotificationItem';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';
import { DEMO_NOTIFICATIONS } from '@/lib/demo-data';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(DEMO_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppShell initialRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-slate-500 font-medium">System updates and issue activity alerts.</p>
          </div>
          <Button variant="outline" size="sm" icon={<Check className="w-4 h-4" />} onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        </div>

        <div className="space-y-3">
          {notifs.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
