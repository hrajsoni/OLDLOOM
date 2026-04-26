'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!token) {
      toast.error('Invitation token missing');
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/accept-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.status === 'ok') {
        toast.success('Account activated! You can now login.');
        router.push('/login');
      } else {
        toast.error(data.message || 'Activation failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', marginBottom: '0.5rem', fontWeight: 300 }}>
        Join the Team
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginBottom: '2rem' }}>
        Set a password to activate your staff account.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--cream)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Set Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }}
          />
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
          {isLoading ? 'Activating...' : 'Activate Account'}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dark)', padding: '2rem' }}>
      <Suspense fallback={<p style={{ color: 'var(--cream-50)' }}>Verifying invitation...</p>}>
        <AcceptInviteForm />
      </Suspense>
    </div>
  );
}
