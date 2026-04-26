'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Stat {
  value: string;
  suffix: string;
  label: string;
  target: number;
}

const STATS: Stat[] = [
  { value: '0',  suffix: '+',  label: 'Embroidery Designs', target: 500  },
  { value: '0',  suffix: '+',  label: 'Orders Delivered',   target: 10000 },
  { value: '0',  suffix: '★',  label: 'Average Rating',     target: 4.9  },
];

// SVG embroidery motif — loom-inspired geometric
const EmbroideryPath = () => (
  <svg
    viewBox="0 0 400 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', maxWidth: '460px' }}
    aria-hidden="true"
  >
    {/* Outer circle */}
    <circle cx="200" cy="200" r="180" stroke="#C9A84C" strokeWidth="0.8" strokeDasharray="1130" strokeDashoffset="1130" className="svg-draw" />
    {/* Inner circle */}
    <circle cx="200" cy="200" r="130" stroke="#C9A84C" strokeWidth="0.6" strokeDasharray="816"  strokeDashoffset="816"  className="svg-draw" />
    {/* Cross lines */}
    <line x1="200" y1="20"  x2="200" y2="380" stroke="#C9A84C" strokeWidth="0.5" strokeDasharray="360" strokeDashoffset="360" className="svg-draw" />
    <line x1="20"  y1="200" x2="380" y2="200" stroke="#C9A84C" strokeWidth="0.5" strokeDasharray="360" strokeDashoffset="360" className="svg-draw" />
    {/* Diagonal lines */}
    <line x1="73"  y1="73"  x2="327" y2="327" stroke="#C9A84C" strokeWidth="0.4" strokeDasharray="360" strokeDashoffset="360" className="svg-draw" />
    <line x1="327" y1="73"  x2="73"  y2="327" stroke="#C9A84C" strokeWidth="0.4" strokeDasharray="360" strokeDashoffset="360" className="svg-draw" />
    {/* Petal arcs */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
      <ellipse
        key={deg}
        cx="200"
        cy="110"
        rx="25"
        ry="65"
        stroke="#F5F0E8"
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="200"
        strokeDashoffset="200"
        className="svg-draw"
        transform={`rotate(${deg} 200 200)`}
        strokeOpacity="0.35"
      />
    ))}
    {/* Center needle motif */}
    <circle cx="200" cy="200" r="8"  fill="#C9A84C" fillOpacity="0.8" />
    <circle cx="200" cy="200" r="3"  fill="#1A1612" />
    <line x1="200" y1="192" x2="200" y2="160" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
    {/* Weft waves */}
    {[140, 165, 195, 225, 250].map((y) => (
      <path
        key={y}
        d={`M60 ${y} Q110 ${y-16} 140 ${y} Q170 ${y+16} 200 ${y} Q230 ${y-16} 260 ${y} Q290 ${y+16} 340 ${y}`}
        stroke="#F5F0E8"
        strokeWidth="0.5"
        fill="none"
        strokeDasharray="300"
        strokeDashoffset="300"
        className="svg-draw"
        strokeOpacity="0.25"
      />
    ))}
    {/* Rust accent arcs */}
    <path d="M200 55 A145 145 0 0 1 345 200" stroke="#B5451B" strokeWidth="1.5" fill="none" strokeDasharray="228" strokeDashoffset="228" className="svg-draw" strokeOpacity="0.6" />
    <path d="M200 345 A145 145 0 0 1 55 200"  stroke="#B5451B" strokeWidth="1.5" fill="none" strokeDasharray="228" strokeDashoffset="228" className="svg-draw" strokeOpacity="0.6" />
  </svg>
);

export function CraftSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef     = useRef<HTMLDivElement>(null);
  const statsRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // SVG path draw-in on scroll
      const paths = sectionRef.current!.querySelectorAll('.svg-draw');
      gsap.to(paths, {
        strokeDashoffset: 0,
        duration: 0.06,
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: svgRef.current,
          start: 'top 80%',
          end:   'center 30%',
          scrub: 1.5,
        },
      });

      // Stat counters count up
      STATS.forEach((stat, i) => {
        const numEl = sectionRef.current!.querySelector(`#stat-num-${i}`);
        if (!numEl) return;
        gsap.from({ val: 0 }, {
          val: stat.target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
          onUpdate: function () {
            const v = this.targets()[0].val;
            numEl.textContent =
              stat.target < 10
                ? v.toFixed(1)
                : Math.floor(v).toLocaleString('en-IN');
          },
        });
      });

      // Fade in sections
      gsap.from([svgRef.current, statsRef.current], {
        opacity: 0,
        y: 50,
        duration: 0.9,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="our-craft"
      style={{
        padding: 'var(--section-py) var(--section-px)',
        background: 'var(--dark)',
        borderTop: '1px solid rgba(201,168,76,0.08)',
      }}
    >
      {/* Section header */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem', textAlign: 'center' }}>
        Our Craft
      </p>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 4rem)', fontWeight: 200, color: 'var(--cream)', letterSpacing: '-0.02em', textAlign: 'center', marginBottom: '5rem' }}>
        Where <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Thread</em> Meets Soul
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '5rem',
          alignItems: 'center',
        }}
      >
        {/* Left — SVG draw-in embroidery */}
        <div ref={svgRef} style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <EmbroideryPath />
            {/* Glowing backdrop circle */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%', height: '60%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
              filter: 'blur(20px)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>

        {/* Right — Stats + copy */}
        <div ref={statsRef}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', lineHeight: 2, color: 'var(--cream-50)', marginBottom: '3rem' }}>
            Every stitch is a decision. Every thread, a commitment to a craft
            that has been woven into India&apos;s identity for centuries.
            At Old Loom, we carry that legacy forward — one garment at a time.
          </p>

          {/* Stat counters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {STATS.map((stat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  paddingBottom: '2rem',
                  borderBottom: i < STATS.length - 1 ? '1px solid rgba(201,168,76,0.1)' : 'none',
                }}
              >
                <div style={{ minWidth: '120px' }}>
                  <span
                    id={`stat-num-${i}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                      fontWeight: 300,
                      color: 'var(--gold)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--rust)', fontWeight: 300 }}>
                    {stat.suffix}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--cream-50)', letterSpacing: '0.05em', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
