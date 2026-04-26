'use client';

import { useRef, useEffect, MutableRefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ProductMeshProps {
  colorHex: string;
  materialRef: MutableRefObject<THREE.MeshStandardMaterial | null>;
}

function ProductMesh({ colorHex, materialRef }: ProductMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const idleTimer = useRef(0);
  const isInteracting = useRef(false);

  // Update material color when colorHex changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color.set(colorHex);
    }
  }, [colorHex, materialRef]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    idleTimer.current += delta;
    // Auto-rotate when idle (controlled via OrbitControls autoRotate)
    // Gentle float
    meshRef.current.position.y = Math.sin(idleTimer.current * 0.5) * 0.05;
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {/* Draped fabric stand-in: BoxGeometry with slight rounded look */}
      <boxGeometry args={[1.6, 2.2, 0.12, 12, 16, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        color={colorHex}
        roughness={0.75}
        metalness={0.05}
        envMapIntensity={0.6}
      />
    </mesh>
  );
}

interface ProductViewerContentProps {
  colorHex: string;
  materialRef: MutableRefObject<THREE.MeshStandardMaterial | null>;
}

export function ProductViewerContent({ colorHex, materialRef }: ProductViewerContentProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#C9A84C" />
      <pointLight position={[0, -3, 3]} intensity={0.5} color="#F5F0E8" />

      <Environment preset="city" />

      <ProductMesh colorHex={colorHex} materialRef={materialRef} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={2}
        maxDistance={6}
        autoRotate
        autoRotateSpeed={0.8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI * 0.75}
      />
    </>
  );
}
