'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Helpers ────────────────────────────────────────────────────────────────────
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

function makeLCG(seed = 73) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function makeTube(pts: THREE.Vector3[], r = 0.005): THREE.TubeGeometry {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  return new THREE.TubeGeometry(curve, 72, r, 4, false);
}

/** Nudge a point away from the center text zone if too close. */
function protect(x: number, y: number, z: number, rng: () => number) {
  // Text lives roughly at x:±1.8, y:±1.2, z > -2.5 (in world space)
  if (z > -2.5 && Math.abs(x) < 1.8 && Math.abs(y) < 1.2) {
    if (rng() > 0.5) x += x >= 0 ? 2.0 : -2.0;
    else             y += y >= 0 ? 1.6 : -1.6;
  }
  return new THREE.Vector3(x, y, z);
}

// ── Shaders ────────────────────────────────────────────────────────────────────
const AMBIENT_VERT = /* glsl */`
  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform float uPhase;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * uFreq + uPhase + p.z * 0.55) * uAmp;
    p.y += cos(uTime * uFreq * 0.62 + uPhase * 1.3 + p.z * 0.38) * uAmp * 0.52;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const AMBIENT_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uOpacity;
  void main() { gl_FragColor = vec4(uColor, uOpacity); }
`;

const INTRO_VERT = /* glsl */`
  uniform float uTime;
  uniform float uReveal;
  uniform float uAmp;
  uniform float uFreq;
  uniform float uPhase;
  uniform vec3  uOffset;
  void main() {
    vec3 p = position + uOffset * (1.0 - uReveal);
    p.x += sin(uTime * uFreq + uPhase + p.z * 0.55) * uAmp * uReveal;
    p.y += cos(uTime * uFreq * 0.62 + uPhase * 1.3) * uAmp * 0.52 * uReveal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const INTRO_FRAG = /* glsl */`
  uniform vec3  uColor;
  uniform float uTargetAlpha;
  uniform float uReveal;
  void main() { gl_FragColor = vec4(uColor, uTargetAlpha * uReveal); }
`;

// ── AmbientThread ──────────────────────────────────────────────────────────────
interface ATCfg {
  pts: THREE.Vector3[]; color: string; opacity: number;
  amp: number; freq: number; phase: number; tubeR?: number;
}
function AmbientThread({ cfg }: { cfg: ATCfg }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => makeTube(cfg.pts, cfg.tubeR ?? 0.004), [cfg.pts, cfg.tubeR]);
  const uni = useMemo(() => ({
    uTime:    { value: 0 },
    uColor:   { value: new THREE.Color(cfg.color) },
    uOpacity: { value: cfg.opacity },
    uAmp:     { value: cfg.amp },
    uFreq:    { value: cfg.freq },
    uPhase:   { value: cfg.phase },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh ref={ref} geometry={geo}>
      <shaderMaterial vertexShader={AMBIENT_VERT} fragmentShader={AMBIENT_FRAG}
        uniforms={uni} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── IntroThread (signature sweep-in) ──────────────────────────────────────────
interface ITCfg {
  pts: THREE.Vector3[]; color: string; targetAlpha: number;
  amp: number; freq: number; phase: number;
  offset: [number, number, number]; startDelay: number; duration: number;
}
function IntroThread({ cfg }: { cfg: ITCfg }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => makeTube(cfg.pts, 0.006), [cfg.pts]);
  const uni = useMemo(() => ({
    uTime:        { value: 0 },
    uReveal:      { value: 0 },
    uColor:       { value: new THREE.Color(cfg.color) },
    uTargetAlpha: { value: cfg.targetAlpha },
    uAmp:         { value: cfg.amp },
    uFreq:        { value: cfg.freq },
    uPhase:       { value: cfg.phase },
    uOffset:      { value: new THREE.Vector3(...cfg.offset) },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const u = (ref.current.material as THREE.ShaderMaterial).uniforms;
    const elapsed = clock.elapsedTime - cfg.startDelay;
    u.uReveal.value = easeOutCubic(elapsed / cfg.duration);
    u.uTime.value   = clock.elapsedTime;
  });
  return (
    <mesh ref={ref} geometry={geo}>
      <shaderMaterial vertexShader={INTRO_VERT} fragmentShader={INTRO_FRAG}
        uniforms={uni} transparent depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ── WovenArc ───────────────────────────────────────────────────────────────────
// radialSegments=6 → hexagonal cross-section at thin radius → hand-crafted look
// Non-uniform scale breaks perfect-circle symmetry → reads as fabric band, not lathe
interface ArcCfg {
  r: number; tube: number; arc: number;
  pos: [number, number, number];
  rot: [number, number, number];
  scl: [number, number, number];
  color: string; emissive: string; emissiveI: number;
  roughness: number; metalness: number; opacity: number;
  driftSpeed: number; driftAxis: 'x' | 'y' | 'z';
}
function WovenArc({ cfg }: { cfg: ArcCfg }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color:            new THREE.Color(cfg.color),
    emissive:         new THREE.Color(cfg.emissive),
    emissiveIntensity: cfg.emissiveI,
    roughness:        cfg.roughness,
    metalness:        cfg.metalness,
    transparent:      true,
    opacity:          cfg.opacity,
    side:             THREE.DoubleSide,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);
  useFrame(() => {
    if (ref.current) ref.current.rotation[cfg.driftAxis] += cfg.driftSpeed;
  });
  return (
    <mesh ref={ref} position={cfg.pos} rotation={cfg.rot} scale={cfg.scl} material={mat}>
      <torusGeometry args={[cfg.r, cfg.tube, 6, 80, cfg.arc]} />
    </mesh>
  );
}

// ── Static Data ────────────────────────────────────────────────────────────────
// Arcs are positioned to FRAME the text zone, not sit behind it.
// Near arcs (z > -2): pushed strongly off-center in XY.
// Far arcs (z < -3): can converge toward center — depth/size keeps them small.
const ARC_DATA: ArcCfg[] = [
  // ── Near frame — upper-left sweep ──────────────────────────────────────────
  { r: 3.1, tube: 0.058, arc: Math.PI * 1.05,
    pos: [-1.3, 2.1,  0.4], rot: [0.25, -0.2,  1.25], scl: [1.28, 0.82, 1.0],
    color: '#2A1C12', emissive: '#C9A84C', emissiveI: 0.03,
    roughness: 0.92, metalness: 0.04, opacity: 0.82,
    driftSpeed:  0.00016, driftAxis: 'z' },

  // ── Near frame — upper-right sweep ─────────────────────────────────────────
  { r: 2.7, tube: 0.05,  arc: Math.PI * 0.78,
    pos: [ 1.7, 1.6, -0.9], rot: [-0.32, 0.48, -1.1], scl: [0.88, 1.22, 1.0],
    color: '#3A2518', emissive: '#C9A84C', emissiveI: 0.025,
    roughness: 0.90, metalness: 0.05, opacity: 0.75,
    driftSpeed: -0.00022, driftAxis: 'x' },

  // ── Near frame — lower-left anchor ─────────────────────────────────────────
  { r: 2.5, tube: 0.062, arc: Math.PI * 1.22,
    pos: [-1.9, -1.9, -1.1], rot: [ 0.55, 0.18,  0.95], scl: [1.12, 0.88, 1.0],
    color: '#261A10', emissive: '#B5451B', emissiveI: 0.018,
    roughness: 0.95, metalness: 0.03, opacity: 0.70,
    driftSpeed:  0.00019, driftAxis: 'y' },

  // ── Near frame — lower-right anchor ────────────────────────────────────────
  { r: 2.2, tube: 0.048, arc: Math.PI * 0.82,
    pos: [ 2.2, -1.5, -1.4], rot: [ 0.75, -0.38, -0.82], scl: [0.85, 1.15, 1.0],
    color: '#1E160E', emissive: '#C9A84C', emissiveI: 0.02,
    roughness: 0.93, metalness: 0.04, opacity: 0.65,
    driftSpeed: -0.00017, driftAxis: 'z' },

  // ── Mid-depth — left accent band ────────────────────────────────────────────
  { r: 1.9, tube: 0.044, arc: Math.PI * 0.68,
    pos: [-2.6, 0.4, -2.6], rot: [ 0.9, -0.5, 1.6], scl: [0.95, 1.25, 1.0],
    color: '#2C1E14', emissive: '#C9A84C', emissiveI: 0.04,
    roughness: 0.91, metalness: 0.03, opacity: 0.62,
    driftSpeed:  0.00028, driftAxis: 'x' },

  // ── Deep convergence — centered but far (size small on screen) ──────────────
  { r: 1.6, tube: 0.052, arc: Math.PI * 1.55,
    pos: [ 0.2, -0.1, -4.0], rot: [ 0.3, 0.8, -0.4], scl: [1.0, 1.05, 0.9],
    color: '#221711', emissive: '#C9A84C', emissiveI: 0.055,
    roughness: 0.89, metalness: 0.06, opacity: 0.72,
    driftSpeed:  0.00032, driftAxis: 'y' },

  // ── Far vanishing — creates tunnel depth ────────────────────────────────────
  { r: 1.2, tube: 0.04,  arc: Math.PI * 1.8,
    pos: [-0.1, 0.3, -6.0], rot: [ 0.15, 0.1, 0.4], scl: [1.0, 1.0, 1.0],
    color: '#1A1209', emissive: '#C9A84C', emissiveI: 0.045,
    roughness: 0.92, metalness: 0.04, opacity: 0.50,
    driftSpeed: -0.00020, driftAxis: 'z' },
];

// ── Intro thread configs — 4 gold strands that sweep into the composition ──────
// Positioned to frame the text — arriving from outside the text zone
const INTRO_THREADS: ITCfg[] = [
  // Strand A: arrives from upper-left, settles across top-left of scene
  {
    pts: [
      new THREE.Vector3(-3.5, 2.5, -0.5),
      new THREE.Vector3(-2.2, 1.8,  -1.2),
      new THREE.Vector3(-1.0, 1.4,  -2.0),
      new THREE.Vector3( 0.2, 1.6,  -3.5),
      new THREE.Vector3( 1.5, 2.0,  -5.0),
    ],
    color: '#C9A84C', targetAlpha: 0.52,
    amp: 0.06, freq: 0.14, phase: 0.0,
    offset: [-2.0, 1.5, 0.8], startDelay: 0.2, duration: 0.9,
  },
  // Strand B: arrives from lower-right, diagonal sweep upward
  {
    pts: [
      new THREE.Vector3( 3.2, -2.2, -0.3),
      new THREE.Vector3( 2.0, -1.5,  -1.5),
      new THREE.Vector3( 0.8, -0.8,  -2.8),
      new THREE.Vector3(-0.5, -1.2,  -4.0),
      new THREE.Vector3(-1.8, -1.8,  -5.5),
    ],
    color: '#C9A84C', targetAlpha: 0.48,
    amp: 0.05, freq: 0.12, phase: 1.3,
    offset: [2.5, -1.8, 0.5], startDelay: 0.45, duration: 0.95,
  },
  // Strand C: thin vertical sweep from top, lands right-side
  {
    pts: [
      new THREE.Vector3( 2.4, 3.5, -0.8),
      new THREE.Vector3( 2.1, 2.0,  -1.8),
      new THREE.Vector3( 1.8, 0.5,  -3.2),
      new THREE.Vector3( 2.5, -0.8, -4.5),
    ],
    color: '#C9A84C', targetAlpha: 0.40,
    amp: 0.04, freq: 0.16, phase: 2.5,
    offset: [0.5, 2.8, 0.3], startDelay: 0.65, duration: 0.85,
  },
  // Strand D: left-to-right gentle arc across lower composition
  {
    pts: [
      new THREE.Vector3(-3.8, -1.0, -1.0),
      new THREE.Vector3(-2.2, -1.6,  -2.2),
      new THREE.Vector3(-0.5, -2.2,  -3.5),
      new THREE.Vector3( 1.2, -1.8,  -4.8),
      new THREE.Vector3( 2.8, -1.0,  -6.0),
    ],
    color: '#C9A84C', targetAlpha: 0.38,
    amp: 0.05, freq: 0.11, phase: 3.8,
    offset: [-3.0, -0.5, 0.6], startDelay: 0.85, duration: 1.0,
  },
];

// ── Ambient thread data (constrained away from center text zone) ───────────────
function buildAmbientThreads(): ATCfg[] {
  const rng   = makeLCG(73);
  const DARK  = ['#3D2B1F', '#2A1C12', '#1E160E', '#2C1E14'];
  const count = 18;

  return Array.from({ length: count }, (_, i) => {
    const baseZ = -0.5 - rng() * 7.5;
    const pts   = Array.from({ length: 7 }, (__, k) => {
      const t  = k / 6;
      const z  = baseZ + (t - 0.5) * 3.2;
      const x  = (rng() - 0.5) * 5.5;
      const y  = (rng() - 0.5) * 4.5;
      return protect(x, y, z, rng);
    });

    return {
      pts,
      color:   DARK[i % DARK.length],
      opacity: 0.22 + rng() * 0.20,
      amp:     0.03 + rng() * 0.055,
      freq:    0.10 + rng() * 0.18,
      phase:   rng() * Math.PI * 2,
      tubeR:   0.003 + rng() * 0.003,
    };
  });
}
const AMBIENT_THREADS = buildAmbientThreads();

// ── WovenEnvironment — exported ────────────────────────────────────────────────
export function WovenEnvironment() {
  return (
    <group>
      {ARC_DATA.map((cfg, i) => <WovenArc key={`arc-${i}`} cfg={cfg} />)}
      {INTRO_THREADS.map((cfg, i) => <IntroThread key={`intro-${i}`} cfg={cfg} />)}
      {AMBIENT_THREADS.map((cfg, i) => <AmbientThread key={`amb-${i}`} cfg={cfg} />)}
    </group>
  );
}
