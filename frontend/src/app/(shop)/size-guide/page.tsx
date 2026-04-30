import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide | Old Loom',
  description: 'Find your perfect fit with the Old Loom size guide for T-shirts, hoodies, joggers, caps, and coord sets.',
};

const SIZE_CHARTS = [
  {
    category: 'T-Shirts & Hoodies',
    headers: ['Size', 'Chest (inches)', 'Length (inches)', 'Shoulder (inches)', 'Sleeve (inches)'],
    rows: [
      ['XS', '34–36', '27', '16.5', '24'],
      ['S',  '36–38', '28', '17.5', '24.5'],
      ['M',  '38–40', '29', '18.5', '25'],
      ['L',  '40–42', '30', '19.5', '25.5'],
      ['XL', '42–44', '31', '20.5', '26'],
      ['XXL','44–46', '32', '21.5', '26.5'],
    ],
  },
  {
    category: 'Joggers & Trousers',
    headers: ['Size', 'Waist (inches)', 'Hip (inches)', 'Length (inches)', 'Thigh (inches)'],
    rows: [
      ['XS', '26–28', '34–36', '40', '21'],
      ['S',  '28–30', '36–38', '41', '22'],
      ['M',  '30–32', '38–40', '42', '23'],
      ['L',  '32–34', '40–42', '43', '24'],
      ['XL', '34–36', '42–44', '44', '25'],
      ['XXL','36–38', '44–46', '45', '26'],
    ],
  },
  {
    category: 'Caps',
    headers: ['Size', 'Head Circumference (cm)', 'Adjustable'],
    rows: [
      ['Free Size', '54–60', 'Yes — rear strap'],
    ],
  },
];

const CELL_STYLE: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontFamily: 'var(--font-body)' as string,
  fontSize: '0.75rem',
  color: 'var(--cream-50)' as string,
  borderBottom: '1px solid rgba(201,168,76,0.08)',
  textAlign: 'left' as const,
};

const HEAD_STYLE: React.CSSProperties = {
  ...CELL_STYLE,
  color: 'var(--gold)' as string,
  fontWeight: 500,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  fontSize: '0.65rem',
};

export default function SizeGuidePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'clamp(3rem,6vw,6rem) var(--section-px)' }}>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem' }}>
          Fit Guide
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
          Size Guide
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--cream-50)', lineHeight: 1.8, marginBottom: '3rem', maxWidth: '560px' }}>
          All measurements are in inches unless stated. Our garments are sized for a relaxed-to-regular fit. When in doubt, size up — our embroidered garments are preshrunk and will not significantly shrink after washing.
        </p>

        {/* Measuring tips */}
        <div style={{
          background: 'rgba(201,168,76,0.06)',
          border: '1px solid rgba(201,168,76,0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '1.5rem 2rem',
          marginBottom: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '0.4rem' }}>Chest</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--cream-50)', lineHeight: 1.7 }}>Measure around the fullest part of your chest, keeping the tape parallel to the floor.</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '0.4rem' }}>Waist</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--cream-50)', lineHeight: 1.7 }}>Measure around your natural waistline — the narrowest point of your torso.</p>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '0.4rem' }}>Hip</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--cream-50)', lineHeight: 1.7 }}>Measure around the fullest part of your hips, about 8 inches below your waist.</p>
          </div>
        </div>

        {/* Size tables */}
        {SIZE_CHARTS.map((chart) => (
          <div key={chart.category} style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '1rem' }}>
              {chart.category}
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                <thead>
                  <tr>
                    {chart.headers.map((h) => (
                      <th key={h} style={HEAD_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(61,43,31,0.2)' }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ ...CELL_STYLE, color: j === 0 ? 'var(--cream)' : 'var(--cream-50)' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(245,240,232,0.3)', marginTop: '2rem', letterSpacing: '0.05em' }}>
          Still unsure? Email us at <a href="mailto:hello@oldloom.in" style={{ color: 'var(--gold)', textDecoration: 'none' }}>hello@oldloom.in</a> with your measurements and we'll help you pick the right size.
        </p>
      </div>
    </div>
  );
}
