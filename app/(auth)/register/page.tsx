'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, User, Mail, Lock, IdCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [campusId, setCampusId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const generatedCampusId = campusId.trim() || `STU-${Date.now().toString().slice(-6)}`;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName: fullName,
          campusId: generatedCampusId,
          role: 'Student', // Public registration creates Student account by default
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details?.join(', ') || 'Failed to register account');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc] text-slate-900 select-none">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0b1727] text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-xl tracking-tight">CampusConnect</h1>
            <p className="text-xs text-slate-400 font-medium">Student Registration</p>
          </div>
        </div>

        <div className="my-auto py-12 max-w-md mx-auto space-y-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-blue-600/20 border border-blue-500/30 text-[#2563eb] mx-auto flex items-center justify-center">
            <User className="w-12 h-12 text-[#2563eb]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Join CampusConnect</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Report campus facilities issues, search lost & found items, and track request resolutions live.
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 font-medium">
          Campus Operational Infrastructure v2
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="flex items-center gap-3 lg:hidden justify-center mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md">
              <School className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg">CampusConnect</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create Student Account</h2>
            <p className="text-sm text-slate-500 font-medium">Sign up to get started</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. alex@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Student / Campus ID"
              type="text"
              placeholder="e.g. STU-2026-901"
              value={campusId}
              onChange={(e) => setCampusId(e.target.value)}
              icon={<IdCard className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 10 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 font-medium pt-4 border-t border-slate-200/80">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#2563eb] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
