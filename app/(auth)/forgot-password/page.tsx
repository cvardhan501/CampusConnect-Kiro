'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { School, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send reset link');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563eb] mx-auto flex items-center justify-center">
            <School className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Forgot Password</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
            <p className="text-xs font-bold text-emerald-800">Reset instructions sent!</p>
            <p className="text-[11px] text-emerald-700">Check your inbox for further details.</p>
            <Link href="/login" className="inline-block pt-2 text-xs font-bold text-[#2563eb]">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. student@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
