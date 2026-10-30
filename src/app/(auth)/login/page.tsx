'use client';

// FestOS Authentication Portal
// Core team member login page
// Luxury theme tokens only, Georgia serif heading, terracotta error banner
// Zero em dashes or en dashes in any UI copy or code

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, User, AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');

  const [memberId, setMemberId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId.trim() || !password) {
      setErrorMessage('Please enter both Member ID and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: memberId.trim().toUpperCase(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 429) {
          setErrorMessage(
            data.error || 'Too many failed login attempts. Please wait 5 minutes before retrying.'
          );
        } else {
          setErrorMessage(data.error || 'Invalid Member ID or password.');
        }
        return;
      }

      // Successful login
      const targetPath =
        nextPath && nextPath.startsWith('/') && !nextPath.startsWith('//')
          ? nextPath
          : `/${data.role}`;

      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5] p-4 sm:p-6 text-[#1A1A1A]">
      <div className="w-full max-w-md">
        {/* Luxury Card */}
        <div className="bg-white border border-[#E5DFD3] rounded-2xl p-7 sm:p-9 shadow-luxury relative overflow-hidden">
          {/* Subtle warm decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#F6EFE6]/70 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#A3703F] via-[#8C6D36] to-[#6E5325] text-white flex items-center justify-center mx-auto text-2xl shadow-md shadow-[#A3703F]/20 font-serif font-bold mb-4">
              🏛
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A1A1A]">
              FestOS
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#A3703F] font-mono font-semibold mt-1">
              Aarohan 2026
            </p>
            <p className="text-sm text-[#6B655E] mt-2">
              Internal portal for the Aarohan core team
            </p>
          </div>

          {/* Terracotta Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FAECEB] border border-[#F0C9C7] text-[#7C2D2A] flex items-start gap-3 text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C45A54] mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div>
              <label
                htmlFor="memberId"
                className="block text-xs font-bold uppercase tracking-wider text-[#6B655E] mb-2"
              >
                Member ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8982]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="memberId"
                  name="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                  placeholder="ST01"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl text-sm font-mono text-[#1A1A1A] placeholder-[#8F8982] focus:outline-none focus:ring-2 focus:ring-[#A3703F]/30 focus:border-[#A3703F] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#6B655E] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8982]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#FAF8F5] border border-[#E5DFD3] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8F8982] focus:outline-none focus:ring-2 focus:ring-[#A3703F]/30 focus:border-[#A3703F] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8F8982] hover:text-[#1A1A1A] transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !memberId.trim() || !password}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#A3703F] hover:bg-[#8C6D36] disabled:opacity-50 disabled:cursor-not-allowed text-white font-serif font-bold text-sm tracking-wide shadow-md shadow-[#A3703F]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Footer Information */}
          <div className="mt-8 pt-6 border-t border-[#E5DFD3] text-center text-xs text-[#8F8982]">
            <p>IIM Indore Aarohan Operations Directorate</p>
            <p className="mt-1 font-mono text-[11px] text-[#A3703F]">
              Restricted to authorized core team personnel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
          <div className="h-10 w-10 rounded-xl bg-[#A3703F] text-white flex items-center justify-center font-serif font-bold animate-pulse">
            🏛
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
