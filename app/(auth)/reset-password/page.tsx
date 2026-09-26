'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { School, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing from the URL link');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563eb] mx-auto flex items-center justify-center">
          <School className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
        <p className="text-xs text-slate-500 font-medium">Create a new secure password for your account.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
          <p className="text-xs font-bold text-emerald-800">Password reset successful!</p>
          <p className="text-[11px] text-emerald-700">Redirecting to login in 3 seconds...</p>
          <Link href="/login" className="inline-block pt-2 text-xs font-bold text-[#2563eb]">
            Login Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="•••••••• (min 10 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Updating password...' : 'Update Password'}
          </Button>
        </form>
      )}

      <div className="text-center">
        <Link href="/login" className="text-xs font-bold text-[#2563eb] hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <Suspense fallback={<div className="text-sm text-slate-400">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
