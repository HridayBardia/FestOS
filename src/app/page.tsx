'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FestOSRootRedirect() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.role) {
          router.replace(`/${data.role}`);
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#FAF8F5] text-[#1A1A1A]">
      <div className="text-center space-y-3">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#A3703F] via-[#8C6D36] to-[#6E5325] text-white flex items-center justify-center mx-auto text-xl shadow-md font-serif font-bold animate-pulse">
          🏛
        </div>
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">FestOS Aarohan 2026</h2>
          <p className="text-xs text-[#8F8982]">Redirecting to authorized departmental portal...</p>
        </div>
      </div>
    </div>
  );
}
