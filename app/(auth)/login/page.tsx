'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { School, Mail, Lock, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleTabs = [
    { id: 'student', label: 'Student' },
    { id: 'staff', label: 'Staff' },
    { id: 'admin', label: 'Admin' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid email/campus ID or password');
      }

      const userRole = data.user?.role?.toLowerCase();
      if (userRole === 'admin') {
        router.push('/admin');
      } else if (userRole === 'staff') {
        router.push('/staff');
      } else {
        router.push(redirectPath);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
      <div className="max-w-md w-full space-y-8">
        <div className="flex items-center gap-3 lg:hidden justify-center mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md">
            <School className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-slate-900 text-lg">CampusConnect</span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-sm text-slate-500 font-medium">Login to your account</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs tabs={roleTabs} activeTab={role} onChange={setRole} variant="segmented" />

          <div className="space-y-4">
            <Input
              label="Email or Student ID"
              type="text"
              placeholder="e.g. student@campus.edu or STU12345"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <div className="flex justify-end mt-1.5">
                <Link href="/forgot-password" className="text-xs font-semibold text-[#2563eb] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#2563eb] font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc] text-slate-900">
      {/* Left Panel - Illustration & Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#f0f6ff] border-r border-blue-50 flex-col justify-between p-12 relative overflow-hidden select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-[#0f172a] text-xl tracking-tight">CampusConnect</h1>
            <p className="text-xs text-slate-500 font-medium">Connect. Report. Recover. Resolve.</p>
          </div>
        </div>

        <div className="my-auto py-8">
          <div className="bg-white rounded-3xl p-8 border border-blue-100/80 shadow-lg shadow-blue-500/5 max-w-md mx-auto text-center space-y-6">
            <div className="w-32 h-32 rounded-full bg-blue-50 text-[#2563eb] mx-auto flex items-center justify-center border-4 border-blue-100">
              <Building2 className="w-16 h-16 text-[#2563eb]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Campus Governance Platform</h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Seamlessly report campus issues, locate lost belongings, and receive real-time updates.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium tracking-wide">A smarter campus, together.</p>
        </div>
      </div>

      <Suspense fallback={<div className="w-full lg:w-1/2 flex items-center justify-center p-6"><p className="text-sm text-slate-400">Loading...</p></div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
