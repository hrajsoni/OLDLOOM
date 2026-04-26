'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(p => p);

  if (paths.length === 0) return null;

  return (
    <nav style={{ padding: '2rem var(--section-px) 0 var(--section-px)', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.7rem', color: 'var(--cream-50)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
      <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
      
      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;
        const label = path.replace(/-/g, ' ');

        return (
          <div key={path} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span>/</span>
            {isLast ? (
              <span style={{ color: 'var(--gold)' }}>{label}</span>
            ) : (
              <Link href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{label}</Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
