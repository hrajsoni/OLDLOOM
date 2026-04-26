'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Reduced from 800 → 380: less visual noise, more luxury restraint
const PARTICLE_COUNT = 380;

const vertexShader = /* glsl */ `
  attribute float aRandom;
  attribute float aSpeed;
  uniform float   uTime;
  varying float   vAlpha;

  void main() {
    vec3 pos = position;

    // Slow, organic drift — amplitude tightened for subtlety
    pos.x += sin(uTime * aSpeed + aRandom * 6.2831) * 0.22;
    pos.y += cos(uTime * aSpeed * 0.7 + aRandom * 3.1416) * 0.18;
    pos.z += sin(uTime * aSpeed * 0.9 + aRandom * 2.0) * 0.12;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    // Size: farther = smaller — kept small for subtlety
    gl_PointSize = (5.0 + aRandom * 3.0) * (1.0 / -mvPos.z);
    gl_PointSize = clamp(gl_PointSize, 0.8, 6.0);

    // Dimmer overall — ambient dust, not disco glitter
    vAlpha = 0.12 + aRandom * 0.35;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  uniform vec3  uColor;

  void main() {
    // Soft circular point — smooth falloff
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float alpha = (1.0 - d * 2.0) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const geometry = useMemo(() => {
    const pos  = new Float32Array(PARTICLE_COUNT * 3);
    const rand = new Float32Array(PARTICLE_COUNT);
    const spd  = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Wider Z spread to fill the tunnel depth (was ±4, now ±7)
      pos[i * 3]     = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 3; // bias toward depth
      rand[i] = Math.random();
      // Slower drift — speed range tightened
      spd[i]  = 0.10 + Math.random() * 0.30;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos,  3));
    geo.setAttribute('aRandom',  new THREE.BufferAttribute(rand, 1));
    geo.setAttribute('aSpeed',   new THREE.BufferAttribute(spd,  1));
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime:  { value: 0 },
      // Warm gold dust — same hue as brand gold, slightly desaturated
      uColor: { value: new THREE.Color('#C9A84C') },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value =
      clock.elapsedTime;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
