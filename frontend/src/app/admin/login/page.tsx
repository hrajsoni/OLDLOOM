'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Invalid credentials');
      setIsLoading(false);
    } else {
      toast.success('Welcome back');
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1A1612',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem',
            color: '#C9A84C',
            fontWeight: 300,
            letterSpacing: '0.05em'
          }}>
            Old Loom
          </h1>
          <p style={{
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.7rem',
            color: 'rgba(245,240,232,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            marginTop: '0.5rem'
          }}>
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="admin-email"
              style={{
                display: 'block',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.7rem',
                color: '#F5F0E8',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.8rem',
                background: 'rgba(61,43,31,0.3)',
                border: '1px solid rgba(201,168,76,0.2)',
                color: '#F5F0E8',
                borderRadius: '4px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              style={{
                display: 'block',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.7rem',
                color: '#F5F0E8',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.8rem',
                background: 'rgba(61,43,31,0.3)',
                border: '1px solid rgba(201,168,76,0.2)',
                color: '#F5F0E8',
                borderRadius: '4px',
                fontFamily: 'DM Mono, monospace',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <button
            id="admin-signin-btn"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#C9A84C',
              color: '#1A1612',
              border: 'none',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '3rem',
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.65rem',
          color: 'rgba(245,240,232,0.3)',
          letterSpacing: '0.1em'
        }}>
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
