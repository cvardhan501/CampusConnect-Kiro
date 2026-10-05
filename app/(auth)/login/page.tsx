'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(data.error || 'Login failed');
      }

      const role = (data.user?.role || 'Student').toLowerCase();
      if (role === 'administrator' || role === 'admin') {
        router.push('/admin');
      } else if (role === 'staff') {
        router.push('/staff');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc] text-slate-900 select-none">
      {/* Left Panel - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0b1727] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-xl tracking-tight">CampusConnect</h1>
            <p className="text-xs text-slate-400 font-medium">Campus Operational Infrastructure v2</p>
          </div>
        </div>

        <div className="my-auto py-12 max-w-md mx-auto space-y-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-blue-600/20 border border-blue-500/30 text-[#2563eb] mx-auto flex items-center justify-center">
            <School className="w-12 h-12 text-[#2563eb]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Smart Campus Platform</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified request lifecycle management for Students, Faculty, Staff, and Administrators.
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 font-medium">
          Secure Authenticated Session System • CampusConnect v2
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="flex items-center gap-3 lg:hidden justify-center mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md">
              <School className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg">CampusConnect</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-sm text-slate-500 font-medium">Access your campus account</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email or Student ID"
              type="text"
              placeholder="e.g. student@campus.edu or STU-1001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none focus:text-slate-600 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
              <div className="text-right pt-1">
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-[#2563eb] hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 font-medium pt-4 border-t border-slate-200/80">
            Don't have an account?{' '}
            <Link href="/register" className="font-bold text-[#2563eb] hover:underline">
              Create Student Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
