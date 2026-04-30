import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Old Loom',
  description: 'Old Loom — the story behind the brand. Premium hand-embroidered clothing celebrating Indian artisanship.',
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--dark)', paddingTop: '5rem' }}>

      {/* Hero */}
      <section style={{
        padding: 'clamp(4rem,8vw,8rem) var(--section-px)',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.6rem',
          letterSpacing: '0.25em',
          color: 'var(--gold)',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
        }}>
          Our Story · Est. 2025
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(3rem,6vw,5rem)',
          fontWeight: 200,
          color: 'var(--cream)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '2rem',
        }}>
          Threads That Tell <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Stories</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          lineHeight: 1.9,
          color: 'var(--cream-50)',
          maxWidth: '640px',
          margin: '0 auto',
        }}>
          Old Loom was born from a simple belief — that the centuries-old art of Indian hand-embroidery deserves to live in everyday clothing. We bridge the gap between traditional craftsmanship and modern streetwear.
        </p>
      </section>

      {/* Divider */}
      <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)' }} />

      {/* Values grid */}
      <section style={{ padding: 'clamp(4rem,8vw,8rem) var(--section-px)' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3rem',
        }}>
          {[
            {
              num: '01',
              title: 'The Craft',
              body: 'Every piece in our collection is hand-embroidered by skilled artisans from Lucknow and Bhopal — cities with a heritage of Chikankari and Zardozi embroidery that stretches back centuries. Each garment takes 6 to 14 hours to embroider by hand.',
            },
            {
              num: '02',
              title: 'The Materials',
              body: 'We source only premium ring-spun cotton, French terry, and Japanese fleece. Our threads are colourfast and tested for durability. The embroidery is applied after the garment is dyed, ensuring perfect colour harmony.',
            },
            {
              num: '03',
              title: 'The Mission',
              body: 'We pay our artisans fairly — at least 3x the local market rate — and offer them stable, long-term employment. We believe that preserving Indian craft traditions requires making them economically viable, not just aspirationally beautiful.',
            },
          ].map((v) => (
            <div key={v.num}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'rgba(201,168,76,0.2)', fontWeight: 200, lineHeight: 1, marginBottom: '1rem' }}>
                {v.num}
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--cream)', marginBottom: '1rem' }}>
                {v.title}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', lineHeight: 1.9, color: 'var(--cream-50)' }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section style={{
        background: 'rgba(61,43,31,0.4)',
        borderTop: '1px solid rgba(201,168,76,0.1)',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
        padding: '4rem var(--section-px)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2rem',
          textAlign: 'center',
        }}>
          {[
            { num: '2,000+', label: 'Garments shipped' },
            { num: '6–14h', label: 'Hours per garment' },
            { num: '12', label: 'Master artisans' },
            { num: '100%', label: 'Handcrafted' },
          ].map((s) => (
            <div key={s.label}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', color: 'var(--gold)', fontWeight: 300, lineHeight: 1 }}>
                {s.num}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: 'var(--cream-50)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.5rem' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(4rem,8vw,8rem) var(--section-px)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3.5rem)', fontWeight: 200, color: 'var(--cream)', marginBottom: '2rem' }}>
          Wear the <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Craft</em>
        </h2>
        <a href="/collections/all" style={{
          display: 'inline-block',
          padding: '1rem 3rem',
          background: 'var(--gold)',
          color: 'var(--dark)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.72rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontWeight: 500,
          textDecoration: 'none',
          borderRadius: 'var(--radius-sm)',
        }}>
          Shop Now
        </a>
      </section>
    </div>
  );
}
