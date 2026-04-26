'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  varying vec2  vUv;
  varying float vElevation;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float elevation =
      sin(pos.x * 1.8 + uTime * 0.7) * 0.10 +
      sin(pos.y * 2.4 + uTime * 0.5) * 0.08 +
      sin((pos.x + pos.y) * 1.3 + uTime * 0.9) * 0.07 +
      sin(pos.x * 3.5 - uTime * 0.4) * 0.04 +
      cos(pos.y * 4.0 + uTime * 0.6) * 0.03;

    pos.z += elevation * uStrength;
    vElevation = elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  uColor;
  uniform float uTime;
  varying vec2  vUv;
  varying float vElevation;

  void main() {
    vec3 col = uColor;

    // Subtle woven-thread grid
    float lx = abs(sin(vUv.x * 90.0)) * 0.09;
    float ly = abs(sin(vUv.y * 90.0)) * 0.09;
    float grid = max(lx, ly);
    col = mix(col, col * 0.65, grid);

    // Shading from elevation
    col *= 0.82 + vElevation * 0.6 + 0.08;

    // Edge vignette
    vec2 uv2 = vUv * 2.0 - 1.0;
    float dist = length(uv2);
    col *= 1.0 - smoothstep(0.5, 1.4, dist) * 0.7;

    gl_FragColor = vec4(col, 0.72);
  }
`;

interface FabricMeshProps {
  scrollProgress: React.MutableRefObject<number>;
}

export function FabricMesh({ scrollProgress }: FabricMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime:     { value: 0 },
      uStrength: { value: 1.0 },
      uColor:    { value: new THREE.Color('#F5F0E8') },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    mat.uniforms.uTime.value = clock.elapsedTime;

    // Grow scale as user scrolls into page
    const s = 1 + scrollProgress.current * 1.4;
    meshRef.current.scale.setScalar(s);

    // Very slow rotation for organic feel
    meshRef.current.rotation.z += 0.00025;
  });

  return (
    <mesh ref={meshRef} rotation={[-0.15, 0, 0]}>
      <planeGeometry args={[4, 4, 80, 80]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
