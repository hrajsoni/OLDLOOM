'use client';

import { Suspense, useRef } from 'react';
import { Canvas, CanvasProps } from '@react-three/fiber';
import { Preload } from '@react-three/drei';

interface SceneProps extends Partial<CanvasProps> {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Scene — Reusable R3F Canvas wrapper
 *
 * Performance defaults:
 * - dpr: [1, 2]            → respects device pixel ratio, capped at 2x
 * - antialias: true         → smooth edges
 * - alpha: true             → transparent background (place over CSS bg)
 * - powerPreference: 'high-performance' → GPU-first
 * - logarithmicDepthBuffer: true → prevents z-fighting on large scenes
 */
export function Scene({ children, className = '', fallback, ...props }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <Canvas
      ref={canvasRef}
      className={className}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        logarithmicDepthBuffer: true,
      }}
      shadows
      camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 1000 }}
      style={{ position: 'absolute', inset: 0 }}
      {...props}
    >
      <Suspense fallback={fallback ?? null}>
        {children}
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
