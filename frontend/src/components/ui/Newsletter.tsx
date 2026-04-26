'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Dummy delay
    setTimeout(() => {
      toast.success('Welcome to the inner circle 🧵');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <section style={{
      padding: 'var(--section-py) var(--section-px)',
      background: 'rgba(61,43,31,0.3)',
      borderTop: '1px solid rgba(201,168,76,0.1)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
          THE INNER CIRCLE
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3rem)', color: 'var(--cream)', fontWeight: 300, marginBottom: '1.5rem', lineHeight: 1.1 }}>
          Crafted Stories, Delivered.
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--cream-50)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Join our mailing list for early access to new collections, artisan stories, and exclusive community events.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '450px', margin: '0 auto' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email Address"
            required
            style={{
              flex: 1,
              padding: '1rem 1.5rem',
              background: 'rgba(26,22,18,0.5)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '4px',
              color: 'var(--cream)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0 2rem',
              background: 'var(--gold)',
              color: 'var(--dark)',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'var(--font-body)',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? '...' : 'Join'}
          </button>
        </form>
      </div>
    </section>
  );
}
