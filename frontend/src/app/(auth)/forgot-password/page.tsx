'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        setIsSent(true);
        toast.success('Reset link sent if account exists');
      } else {
        toast.error(data.message || 'Something went wrong');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '0.5rem', fontWeight: 300 }}>
          Reset Password
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginBottom: '2rem' }}>
          {isSent ? "Check your email for the recovery link." : "Enter your email to receive a password reset link."}
        </p>

        {!isSent ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--cream)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '1rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
            >
              {isLoading ? 'Processing...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsSent(false)}
            style={{ width: '100%', padding: '1rem', background: 'rgba(245,240,232,0.1)', color: 'var(--cream)', border: '1px solid rgba(245,240,232,0.2)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            Try another email
          </button>
        )}

        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
          Remembered? <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
