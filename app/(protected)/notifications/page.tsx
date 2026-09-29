'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { NotificationItem } from '@/components/ui/NotificationItem';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Check, Bell } from 'lucide-react';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const fetchedNotifs = Array.isArray(data.notifications)
            ? data.notifications
            : Array.isArray(data)
            ? data
            : [];
          setNotifs(fetchedNotifs);
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifs(notifs.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <AppShell initialRole="student">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-sm text-slate-500 font-medium">System updates and issue activity alerts.</p>
          </div>
          {notifs.length > 0 && (
            <Button variant="outline" size="sm" icon={<Check className="w-4 h-4" />} onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-xs text-slate-400 py-8">Loading notifications...</p>
          ) : notifs.length === 0 ? (
            <EmptyState
              title="You're all caught up"
              description="No new notifications or system alerts at this time."
              icon={<Bell className="w-8 h-8 text-blue-600" />}
            />
          ) : (
            notifs.map((notification) => (
              <NotificationItem key={notification._id || notification.id} notification={notification} />
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
