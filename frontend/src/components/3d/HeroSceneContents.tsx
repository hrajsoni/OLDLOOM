'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { WovenEnvironment } from './WovenEnvironment';
import { ParticleField } from './ParticleField';

const BREATH_AMP   = 0.007;
const BREATH_SPEED = 0.15;

function CameraRig({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const { camera } = useThree();

  // Camera travels INTO the woven corridor on scroll.
  // End-point is inside the arc layers but never so deep it loses the composition.
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3( 0,    0,    5.0),  // entrance — full hero visible
        new THREE.Vector3( 0.12, 0.15, 3.4),  // gentle drift in
        new THREE.Vector3(-0.06, 0.42, 1.4),  // pushing through near arcs
        new THREE.Vector3( 0,    0.65,-0.6),  // settled inside environment
      ]),
    []
  );

  const splinePt  = useMemo(() => new THREE.Vector3(), []);
  const lookAt    = useMemo(() => new THREE.Vector3(0, 0.15, 0), []);
  const clockRef  = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const t = Math.min(scrollProgress.current * 2.0, 1);
    curve.getPoint(t, splinePt);
    // Ambient breathing overlaid on scroll position
    splinePt.x += Math.sin(clockRef.current * BREATH_SPEED)        * BREATH_AMP;
    splinePt.y += Math.cos(clockRef.current * BREATH_SPEED * 0.71) * BREATH_AMP;
    camera.position.lerp(splinePt, 0.022);
    camera.lookAt(lookAt);
  });

  return null;
}

export function HeroSceneContents({
  scrollProgress,
}: {
  scrollProgress: React.MutableRefObject<number>;
}) {
  return (
    <>
      {/*
        Lighting tuned for high-roughness textile materials:
        - Low ambient so arcs are carved from darkness
        - Warm gold key from upper-right (single strong source)
        - Cool-dark rim from lower-left (depth separation)
        - Soft fill from camera-side (lifts mid-tone without flattening)
        - Deep tunnel glow (warm, low intensity — emissive enhancement)
      */}
      <ambientLight intensity={0.28} color="#EDE4D5" />

      {/* Key — warm, directional, editorial */}
      <directionalLight position={[3.5, 5, 3]} intensity={1.4} color="#C9A84C" />

      {/* Rim — separates arcs from the deep dark */}
      <directionalLight position={[-5, -3, -4]} intensity={0.25} color="#4A3020" />

      {/* Camera fill — very soft, prevents total shadow on front faces */}
      <pointLight position={[0, 0.5, 4.5]} intensity={0.35} color="#3D2B1F" distance={12} />

      {/* Tunnel depth accent — warms the deep environment subtly */}
      <pointLight position={[0, 0, -4.5]} intensity={0.55} color="#B8922E" distance={9} />

      <WovenEnvironment />
      <ParticleField />
      <CameraRig scrollProgress={scrollProgress} />

      <EffectComposer>
        {/* Bloom: only the brightest emissive edges glow — not the whole scene */}
        <Bloom intensity={0.45} luminanceThreshold={0.88} luminanceSmoothing={0.95} mipmapBlur />
        {/* Vignette: strong corners to frame the tunnel entrance */}
        <Vignette offset={0.18} darkness={0.92} />
      </EffectComposer>
    </>
  );
}
