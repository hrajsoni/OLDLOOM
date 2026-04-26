'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useUIStore } from '@/store/uiStore';

export function AnnouncementBar() {
  const [content, setContent] = useState<any>(null);
  const { announcementDismissed, dismissAnnouncement } = useUIStore();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await api.get('/content');
        if (data.data?.announcementBar) {
          setContent(data.data.announcementBar);
        }
      } catch (err) {
        // Silently fail
      }
    };
    fetchContent();
  }, []);

  if (!content || !content.isActive || announcementDismissed) return null;

  return (
    <div style={{
      background: content.bgColor || 'var(--gold)',
      color: content.textColor || 'var(--dark)',
      padding: '0.6rem 2rem',
      textAlign: 'center',
      fontSize: '0.75rem',
      fontFamily: 'var(--font-mono)',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      position: 'relative',
      zIndex: 1000,
    }}>
      {content.text}
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
