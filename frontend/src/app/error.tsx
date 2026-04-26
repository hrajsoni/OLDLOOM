'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to Sentry when integrated
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#1A1612] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="#B5451B" strokeWidth="2" opacity="0.3" />
          <line x1="25" y1="25" x2="55" y2="55" stroke="#B5451B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="55" y1="25" x2="25" y2="55" stroke="#B5451B" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <h1
        className="text-3xl font-bold text-[#F5F0E8] mb-3"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        Something went wrong
      </h1>
      <p className="text-[#F5F0E8]/40 font-mono text-sm max-w-sm mb-8 leading-relaxed">
        An unexpected error occurred. Our team has been notified.
        {error.digest && (
          <span className="block mt-2 text-[#F5F0E8]/20 text-xs">
            Error ID: {error.digest}
          </span>
        )}
      </p>

      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-[#C9A84C] text-[#1A1612] px-6 py-2.5 rounded-full font-bold font-mono text-sm hover:bg-[#C9A84C]/90 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-[#F5F0E8]/10 text-[#F5F0E8]/60 px-6 py-2.5 rounded-full font-mono text-sm hover:text-[#F5F0E8] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
