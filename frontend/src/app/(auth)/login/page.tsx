'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error('Invalid credentials');
      } else {
        toast.success('Logged in successfully');
        router.push('/account');
        router.refresh();
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/account' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--dark)' }}>
      {/* Left side - Loom weaving scene (simplified placeholder for 3D) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(61,43,31,0.2)', borderRight: '1px solid rgba(201,168,76,0.1)' }} className="hidden md:flex">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--gold)', fontWeight: 300 }}>Old Loom</h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '1rem' }}>Crafted threads</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '0.5rem', fontWeight: 300 }}>
            Welcome Back
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginBottom: '2rem' }}>
            Sign in to your account.
          </p>

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
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--cream)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{ width: '100%', padding: '1rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }} />
            <span style={{ padding: '0 1rem', fontFamily: 'var(--font-body)', color: 'var(--cream-50)', fontSize: '0.8rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(201,168,76,0.2)' }} />
          </div>

          <button
            onClick={handleGoogleSignIn}
            style={{ width: '100%', padding: '1rem', background: 'rgba(245,240,232,0.1)', color: 'var(--cream)', border: '1px solid rgba(245,240,232,0.2)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
