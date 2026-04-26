'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  // SVG thread refs
  const path1Ref = useRef<SVGPathElement>(null);
  const path2Ref = useRef<SVGPathElement>(null);
  const path3Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in number
      gsap.from(numberRef.current, {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });

      gsap.from(textRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power2.out',
      });

      gsap.from(btnRef.current, {
        y: 16,
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        ease: 'power2.out',
      });

      // Broken thread animation — paths draw then break
      [path1Ref, path2Ref, path3Ref].forEach((ref, i) => {
        if (!ref.current) return;
        const len = ref.current.getTotalLength();
        gsap.set(ref.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(ref.current, {
          strokeDashoffset: 0,
          duration: 1.2,
          delay: 0.4 + i * 0.15,
          ease: 'power2.inOut',
        });
        // "Break" effect — partial retract
        gsap.to(ref.current, {
          strokeDashoffset: len * 0.3,
          duration: 0.4,
          delay: 1.8 + i * 0.1,
          ease: 'power3.in',
        });
      });

      // Floating animation on the SVG
      gsap.to('.not-found-svg', {
        y: -12,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#1A1612] flex flex-col items-center justify-center px-4 text-center"
    >
      {/* Broken thread SVG */}
      <div className="not-found-svg mb-8">
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none">
          {/* Loom vertical threads */}
          {[40, 80, 120, 160].map((x) => (
            <line
              key={x}
              x1={x} y1="10"
              x2={x} y2="150"
              stroke="rgba(201,168,76,0.15)"
              strokeWidth="1"
            />
          ))}

          {/* Weft thread 1 — intact */}
          <path
            ref={path1Ref}
            d="M 20 50 Q 60 40 100 50 Q 140 60 180 50"
            stroke="#C9A84C"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Weft thread 2 — breaks in middle */}
          <path
            ref={path2Ref}
            d="M 20 80 Q 60 70 100 80"
            stroke="#C9A84C"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          {/* Weft thread 3 — broken end, dangles */}
          <path
            ref={path3Ref}
            d="M 110 85 Q 145 75 180 80 Q 185 100 175 110"
            stroke="#B5451B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.8"
          />

          {/* Needle */}
          <line
            x1="95" y1="25"
            x2="105" y2="95"
            stroke="#F5F0E8"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <ellipse
            cx="100" cy="22"
            rx="4" ry="6"
            stroke="#F5F0E8"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />

          {/* Break indicator */}
          <circle cx="108" cy="82" r="3" fill="#B5451B" opacity="0.6" />
        </svg>
      </div>

      <h1
        ref={numberRef}
        className="text-[8rem] font-bold text-[#F5F0E8]/10 font-mono leading-none mb-2 select-none"
      >
        404
      </h1>

      <h2 className="text-2xl font-bold text-[#F5F0E8] mb-3"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Thread Broken
      </h2>

      <p
        ref={textRef}
        className="text-[#F5F0E8]/40 font-mono text-sm max-w-sm mb-8 leading-relaxed"
      >
        The page you're looking for has unravelled.
        Let's get you back to the weave.
      </p>

      <Link
        ref={btnRef}
        href="/"
        className="inline-flex items-center gap-2 bg-[#C9A84C] text-[#1A1612] px-8 py-3 rounded-full font-bold font-mono text-sm hover:bg-[#C9A84C]/90 transition-colors"
      >
        Back to Home
      </Link>

      {/* Background grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
