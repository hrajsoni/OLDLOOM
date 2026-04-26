'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 2) {
      toast.error('Please choose a stronger password');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      
      if (data.status === 'ok') {
        toast.success('Registration successful. Please verify your email.');
        setStep('verify');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (data.status === 'ok') {
        toast.success('Email verified! You can now login.');
        router.push('/login');
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--dark)' }}>
      {/* Left side */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', background: 'rgba(61,43,31,0.2)', borderRight: '1px solid rgba(201,168,76,0.1)' }} className="hidden md:flex">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--gold)', fontWeight: 300 }}>Old Loom</h2>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.8rem', marginTop: '1rem' }}>Join the Journey</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', marginBottom: '0.5rem', fontWeight: 300 }}>
            {step === 'register' ? 'Create Account' : 'Verify Email'}
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginBottom: '2rem' }}>
            {step === 'register' 
              ? 'Register to track orders and save your wishlist.' 
              : `We've sent a 6-digit OTP to ${email}.`}
          </p>

          {step === 'register' ? (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--cream)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.8rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--cream)', borderRadius: '4px' }}
                />
              </div>
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
                {password && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '4px' }}>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: '4px',
                          flex: 1,
                          background: i < strength ? strengthColors[strength - 1] : 'rgba(201,168,76,0.2)',
                          borderRadius: '2px',
                          transition: 'background 0.3s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', padding: '1rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--cream)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  placeholder="000000"
                  style={{ width: '100%', padding: '1rem', background: 'rgba(61,43,31,0.3)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)', borderRadius: '4px', textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem', fontFamily: 'monospace' }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{ width: '100%', padding: '1rem', background: 'var(--gold)', color: 'var(--dark)', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '1rem' }}
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              <button
                type="button"
                onClick={() => setStep('register')}
                style={{ background: 'none', border: 'none', color: 'var(--cream-50)', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                ← Back to registration
              </button>
            </form>
          )}

          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
