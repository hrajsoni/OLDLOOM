'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/uiStore';

const FALLBACK_MESSAGES = [
  '🧵 Free shipping on orders above ₹5,000 — Crafted in India',
  '✨ New collections dropping every week — Shop Men, Women & Couples',
  '🪡 Handcrafted embroidery · Est. 2025 · Wear the story',
];

interface AnnouncementContent {
  text: string;
  bgColor: string;
  textColor: string;
  isActive: boolean;
}

export function AnnouncementBar() {
  const [content, setContent] = useState<AnnouncementContent | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const { announcementDismissed, dismissAnnouncement } = useUIStore();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/content`);
        const data = await res.json();
        if (data.data?.announcementBar?.isActive) setContent(data.data.announcementBar);
      } catch { /* use fallback */ }
    };
    fetchContent();
    const timer = setInterval(() => setMsgIdx(i => (i + 1) % FALLBACK_MESSAGES.length), 4000);
    return () => clearInterval(timer);
  }, []);

  if (announcementDismissed) return null;

  return (
    <div style={{
      background: content?.bgColor || 'var(--gold)',
      color: content?.textColor || 'var(--dark)',
      padding: '0.55rem 2rem',
      textAlign: 'center',
      fontSize: '0.7rem',
      fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      position: 'relative',
      zIndex: 600,
    }}>
      {content?.text || FALLBACK_MESSAGES[msgIdx]}

      <button
        onClick={dismissAnnouncement}
        style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '1rem',
          opacity: 0.6
        }}
      >
        ✕
      </button>
    </div>
  );
}
