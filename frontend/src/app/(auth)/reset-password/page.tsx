'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const calculateStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = calculateStrength(password);
  const strengthColors = ['#B5451B', '#C9A84C', '#C9A84C', '#34A853'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invalid session');
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        toast.success('Password updated successfully');
        router.push('/login');
      } else {
        toast.error(data.message || 'Reset failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '0.5rem', fontWeight: 300 }}>
        New Password
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginBottom: '2rem' }}>
        Create a secure password for your account.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--cream)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }}
          />
          {password && (
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '4px' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ height: '4px', flex: 1, background: i < strength ? strengthColors[strength - 1] : 'rgba(201,168,76,0.2)', borderRadius: '2px' }} />
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--cream)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{ width: '100%', padding: '1rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
        >
          {isLoading ? 'Updating...' : 'Set Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', padding: '2rem' }}>
      <Suspense fallback={<p style={{ color: 'var(--cream-50)' }}>Loading session...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
