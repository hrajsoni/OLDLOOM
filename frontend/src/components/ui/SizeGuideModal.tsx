'use client';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  if (!isOpen) return null;

  const data = [
    { size: 'XS', chest: '86 cm / 34"', waist: '76 cm / 30"', length: '68 cm / 27"' },
    { size: 'S', chest: '91 cm / 36"', waist: '81 cm / 32"', length: '70 cm / 28"' },
    { size: 'M', chest: '96 cm / 38"', waist: '86 cm / 34"', length: '72 cm / 28.5"' },
    { size: 'L', chest: '101 cm / 40"', waist: '91 cm / 36"', length: '74 cm / 29"' },
    { size: 'XL', chest: '106 cm / 42"', waist: '96 cm / 38"', length: '76 cm / 30"' },
    { size: 'XXL', chest: '111 cm / 44"', waist: '101 cm / 40"', length: '78 cm / 31"' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,13,11,0.9)', backdropFilter: 'blur(5px)' }} />
      <div style={{ position: 'relative', width: '100%', maxWidth: '600px', background: 'var(--dark)', border: '1px solid var(--gold)', padding: '2.5rem', borderRadius: '8px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--cream-50)', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold)', marginBottom: '0.5rem', fontWeight: 300 }}>Size Guide</h2>
        <p style={{ color: 'var(--cream-50)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>Measurements are taken when the garment is flat.</p>

        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--cream)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(201,168,76,0.3)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Size</th>
              <th style={{ padding: '1rem' }}>Chest</th>
              <th style={{ padding: '1rem' }}>Waist</th>
              <th style={{ padding: '1rem' }}>Length</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.size} style={{ borderBottom: '1px solid rgba(245,240,232,0.05)' }}>
                <td style={{ padding: '1rem', color: 'var(--gold)', fontWeight: 600 }}>{row.size}</td>
                <td style={{ padding: '1rem' }}>{row.chest}</td>
                <td style={{ padding: '1rem' }}>{row.waist}</td>
                <td style={{ padding: '1rem' }}>{row.length}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '2.5rem', background: 'rgba(201,168,76,0.05)', padding: '1.5rem', borderRadius: '4px' }}>
          <p style={{ fontSize: '0.75rem', lineHeight: 1.6, color: 'var(--cream-50)' }}>
            <strong>Fit Tip:</strong> If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a tailored look. For oversized items, go with your true size.
          </p>
        </div>
      </div>
    </div>
  );
}
