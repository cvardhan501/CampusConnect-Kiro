'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, User, Mail, Lock, Building2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      const roleMap: Record<string, 'Student' | 'Staff' | 'Administrator'> = {
        student: 'Student',
        staff: 'Staff',
        admin: 'Administrator',
      };

      const campusId = `STU_${Date.now().toString().slice(-6)}`;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName: fullName,
          campusId,
          role: roleMap[role] || 'Student',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.details?.join(', ') || 'Failed to register account');
      }

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'staff') {
        router.push('/staff');
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

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
                Join thousands of students and faculty members collaborating for a better campus environment.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 font-medium tracking-wide">A smarter campus, together.</p>
        </div>
      </div>

      {/* Right Panel - Register Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md w-full space-y-8">
          <div className="flex items-center gap-3 lg:hidden justify-center mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md">
              <School className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900 text-lg">CampusConnect</span>
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create Your Account</h2>
            <p className="text-sm text-slate-500 font-medium">Join CampusConnect today</p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Tabs tabs={roleTabs} activeTab={role} onChange={(r: any) => setRole(r)} variant="segmented" />

            <div className="space-y-3.5">
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
                label="Email or Student ID"
                type="text"
                placeholder="e.g. student@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="•••••••• (min 10 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2563eb] font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
