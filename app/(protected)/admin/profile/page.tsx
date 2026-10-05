'use client';

import React, { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Shield, Key, Eye, EyeOff } from 'lucide-react';

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password update form state
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (data?.user) {
          setUser({
            name: data.user.displayName || 'Administrator',
            email: data.user.email || 'admin@campusconnect.local',
            role: data.user.role || 'Administrator',
            department: data.user.department || 'Administration',
            phone: data.user.contactPhone || data.user.phoneNumber || '+1 987 654 3210',
            lastLogin: new Date().toLocaleString(),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (!newPassword || newPassword.length < 10) {
      setPasswordError('New password must be at least 10 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch('/api/admin/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess('Password updated successfully.');
      setTimeout(() => {
        setIsPasswordFormOpen(false);
        resetPasswordForm();
      }, 1500);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <AppShell initialRole="admin">
      <div className="max-w-3xl mx-auto space-y-6 select-none">
        {/* Header (Matching Screen #15) */}
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Profile</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your account settings.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs font-semibold text-slate-400">Loading admin profile...</div>
        ) : (
          <div className="space-y-6">
            {/* Admin Profile Card (Matching Screen #15) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-6">
              <div className="flex items-center gap-6">
                <Avatar name={user?.name} size="lg" className="w-20 h-20 text-2xl border-2 border-blue-200" />
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">{user?.name}</h2>
                  <p className="text-xs text-slate-500 font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Role:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.role}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Department:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.department}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Last Login:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{user?.lastLogin}</p>
                </div>
              </div>
            </div>

            {/* Security Section (Matching Screen #15) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Security</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-[#2563eb]" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Change Password</p>
                      <p className="text-[10px] text-slate-500 font-medium">Update your account password</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      resetPasswordForm();
                      setIsPasswordFormOpen(true);
                    }}
                  >
                    Update
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Two-factor authentication</p>
                    <p className="text-[10px] text-slate-500 font-medium">Enhanced account protection</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Update Password Modal */}
        <Modal
          isOpen={isPasswordFormOpen}
          onClose={() => {
            setIsPasswordFormOpen(false);
            resetPasswordForm();
          }}
          title="Update Admin Password"
          subtitle="Enter your current password and a new secure password."
        >
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
                {passwordSuccess}
              </div>
            )}

            <Input
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password (min. 10 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPasswordFormOpen(false);
                  resetPasswordForm();
                }}
                disabled={updatingPassword}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={updatingPassword}
                disabled={updatingPassword}
              >
                Save Password
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
