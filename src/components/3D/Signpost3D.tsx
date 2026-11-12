'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';

import '@/components/css/signpost.css';

// Filter out internal Three.js and React 19 unmount notices
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('THREE.Clock: This module has been deprecated') ||
        args[0].includes('PCFSoftShadowMap has been removed'))
    ) {
      return;
    }
    originalWarn(...args);
  };

  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Attempted to synchronously unmount a root')
    ) {
      return;
    }
    originalError(...args);
  };
}

export type SignpostRoute = '/' | '/about' | '/blog' | '/projects' | '/contact';

export interface Signpost3DProps {
  onNavigate?: (href: SignpostRoute) => void;
  isActiveView?: boolean;
}

type DirectionSignProps = {
  title: string;
  subtitle: string;
  distance: string;
  href: SignpostRoute;
  side: 'left' | 'right';
  y: number;
  icon: string;
  phaseOffset: number;
  woodBaseColor: string;
  woodHoverColor: string;
  onNavigate?: (href: SignpostRoute) => void;
};

/**
 * Automatically adjusts camera distance and FOV on narrow mobile screens
 * so the entire 3D wooden signpost and planks fit comfortably inside 100dvh.
 */
function ResponsiveCameraRig() {
  const { camera, size } = useThree();

  useEffect(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);

    if (size.width < 480) {
      persp.position.set(0, 0.08, 12.6);
      persp.fov = 42;
    } else if (size.width < 768 || aspect < 0.85) {
      persp.position.set(0, 0.08, 11.4);
      persp.fov = 40;
    } else {
      persp.position.set(0, 0.1, 9.6);
      persp.fov = 37;
    }
    persp.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

function DirectionSign({
  title,
  subtitle,
  distance,
  href,
  side,
  y,
  icon,
  phaseOffset,
  woodBaseColor,
  woodHoverColor,
  onNavigate,
}: DirectionSignProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // Pivot group sits right at x = 0 (center of the wooden post) so rotation swings from the post hinge
  const pivotRef = useRef<THREE.Group>(null);
  const plankGroupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  // Underdamped spring physics state for realistic wooden bar swing
  const rotYVel = useRef(0);
  const rotZVel = useRef(0);
  const liftZVel = useRef(0);

  const plankCenterOffset = side === 'left' ? -1.58 : 1.58;
  const baseTiltZ = side === 'left' ? -0.018 : 0.018;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    // Subtle organic autumn breeze sway when idle
    const windSwayY = Math.sin(t * 1.45 + phaseOffset) * 0.022;
    const windSwayZ = Math.cos(t * 1.15 + phaseOffset) * 0.006;

    if (pivotRef.current) {
      const hoverSwingY = hovered
        ? side === 'left'
          ? -0.22
          : 0.22
        : windSwayY;
      const pressKickY = pressed ? (side === 'left' ? 0.12 : -0.12) : 0;
      const targetY = hoverSwingY + pressKickY;

      // Spring solver for Y rotation around central post hinge
      const stiffnessY = hovered ? 175 : 115;
      const dampingY = hovered ? 13 : 11;
      const forceY = (targetY - pivotRef.current.rotation.y) * stiffnessY;
      rotYVel.current += forceY * dt;
      rotYVel.current *= Math.exp(-dampingY * dt);
      pivotRef.current.rotation.y += rotYVel.current * dt;

      // Spring solver for Z tilt
      const targetZ =
        baseTiltZ +
        windSwayZ +
        (hovered ? (side === 'left' ? 0.028 : -0.028) : 0);
      const forceZ = (targetZ - pivotRef.current.rotation.z) * 140;
      rotZVel.current += forceZ * dt;
      rotZVel.current *= Math.exp(-12 * dt);
      pivotRef.current.rotation.z += rotZVel.current * dt;
    }

    if (plankGroupRef.current) {
      const targetLiftZ = hovered ? 0.09 : 0;
      const forceLift = (targetLiftZ - plankGroupRef.current.position.z) * 160;
      liftZVel.current += forceLift * dt;
      liftZVel.current *= Math.exp(-14 * dt);
      plankGroupRef.current.position.z += liftZVel.current * dt;
    }

    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const targetColor = new THREE.Color(
        hovered ? woodHoverColor : woodBaseColor,
      );
      mat.color.lerp(targetColor, 0.16);
    }
  });

  // Tapered wooden arrow plank shape with carved notch aesthetics
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w = 3.08;
    const h = 0.84;
    const tip = 0.42;

    if (side === 'left') {
      s.moveTo(-w / 2 + tip, -h / 2);
      s.lineTo(w / 2, -h / 2);
      s.lineTo(w / 2, h / 2);
      s.lineTo(-w / 2 + tip, h / 2);
      s.lineTo(-w / 2, 0);
    } else {
      s.moveTo(-w / 2, -h / 2);
      s.lineTo(w / 2 - tip, -h / 2);
      s.lineTo(w / 2, 0);
      s.lineTo(w / 2 - tip, h / 2);
      s.lineTo(-w / 2, h / 2);
    }

    s.closePath();
    return s;
  }, [side]);

  const geometry = useMemo(
    () =>
      new THREE.ExtrudeGeometry(shape, {
        depth: 0.13,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.024,
        bevelThickness: 0.024,
      }),
    [shape],
  );

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setPressed(true);
    setTimeout(() => setPressed(false), 240);
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
  };

  // Sign label content fitted inside the wooden arrow plank
  const renderLabelContent = (isReverseDirection: boolean = false) => {
    const isPointingLeft =
      (!isReverseDirection && side === 'left') ||
      (isReverseDirection && side === 'right');

    return (
      <Link
        href={href}
        onClick={handleLinkClick}
        className={`sign-label ${isPointingLeft ? 'sign-label-left' : 'sign-label-right'} ${hovered ? 'sign-label-active' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {isPointingLeft ? (
          <>
            <span className="sign-icon" title={title}>
              {icon}
            </span>
            <span className="sign-copy">
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </span>
            <span className="sign-distance" style={{ marginLeft: 'auto' }}>
              {distance}
            </span>
          </>
        ) : (
          <>
            <span className="sign-distance" style={{ marginRight: 'auto' }}>
              {distance}
            </span>
            <span className="sign-copy" style={{ textAlign: 'right' }}>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </span>
            <span className="sign-icon" title={title}>
              {icon}
            </span>
          </>
        )}
      </Link>
    );
  };

  // Center the HTML inside the flat rectangular body away from the pointed arrow tip
  const htmlXOffset = side === 'left' ? 0.14 : -0.14;

  return (
    <group ref={pivotRef} position={[0, y, 0]} rotation={[0, 0, baseTiltZ]}>
      {/* Iron Mounting Collar around the central post */}
      <mesh position={[0, 0, -0.08]} castShadow>
        <boxGeometry args={[0.38, 0.24, 0.38]} />
        <meshStandardMaterial
          color="#2b1d16"
          metalness={0.68}
          roughness={0.34}
        />
      </mesh>

      {/* Offset Plank Body attached to the post hinge */}
      <group ref={plankGroupRef} position={[plankCenterOffset, 0, 0]}>
        {/* Extruded 3D wooden sign plank */}
        <mesh
          ref={meshRef}
          geometry={geometry}
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setPressed(true);
            setTimeout(() => setPressed(false), 240);
            if (onNavigate) onNavigate(href);
          }}
        >
          <meshStandardMaterial
            color={woodBaseColor}
            roughness={0.65}
            metalness={0.04}
          />
        </mesh>

        {/* Top & Bottom Decorative Timber Trim Strips */}
        <mesh position={[side === 'left' ? 0.18 : -0.18, 0.39, 0.065]}>
          <boxGeometry args={[2.55, 0.035, 0.155]} />
          <meshStandardMaterial color="#4a2c18" roughness={0.6} />
        </mesh>
        <mesh position={[side === 'left' ? 0.18 : -0.18, -0.39, 0.065]}>
          <boxGeometry args={[2.55, 0.035, 0.155]} />
          <meshStandardMaterial color="#4a2c18" roughness={0.6} />
        </mesh>

        {/* Forged Iron Mounting Bolts fastening plank near the central post */}
        {[-0.22, 0.22].map((pinY) => (
          <group
            key={pinY}
            position={[side === 'left' ? 1.32 : -1.32, pinY, 0.065]}
          >
            {/* Front Bolt Head */}
            <mesh position={[0, 0, 0.095]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.052, 0.052, 0.03, 16]} />
              <meshStandardMaterial
                color="#d97706"
                metalness={0.78}
                roughness={0.25}
              />
            </mesh>
            {/* Back Bolt Head */}
            <mesh position={[0, 0, -0.095]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.052, 0.052, 0.03, 16]} />
              <meshStandardMaterial
                color="#d97706"
                metalness={0.78}
                roughness={0.25}
              />
            </mesh>
          </group>
        ))}

        {/* FRONT FACE HTML (fitted directly on front plank surface) */}
        <Html
          transform
          position={[htmlXOffset, 0, 0.162]}
          center
          distanceFactor={1.32}
          className="sign-html-container"
        >
          {renderLabelContent(false)}
        </Html>

        {/* BACK FACE HTML (rotated 180°, fitted directly on back plank surface) */}
        <Html
          transform
          position={[htmlXOffset, 0, -0.032]}
          rotation={[0, Math.PI, 0]}
          center
          distanceFactor={1.32}
          className="sign-html-container"
        >
          {renderLabelContent(true)}
        </Html>
      </group>
    </group>
  );
}

function Scene({ onNavigate }: { onNavigate?: (href: SignpostRoute) => void }) {
  return (
    <>
      <ResponsiveCameraRig />

      <ambientLight intensity={1.45} />

      <directionalLight
        position={[-4.5, 7.5, 6.5]}
        intensity={2.6}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight
        position={[4, 2.5, 3.5]}
        intensity={38}
        distance={14}
        color="#ffd39a"
      />

      <pointLight
        position={[-3, -1.5, -3]}
        intensity={16}
        distance={10}
        color="#f59e0b"
      />

      {/* Central Hand-Hewn Timber Post */}
      <group position={[0, 0, -0.08]}>
        {/* Main Post Shaft */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.32, 5.75, 0.32]} />
          <meshStandardMaterial color="#4a2e1f" roughness={0.62} />
        </mesh>

        {/* Chamfered Corner Accent Pillar */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 5.65, 0.26]} />
          <meshStandardMaterial color="#3d2417" roughness={0.68} />
        </mesh>

        {/* Stepped Architectural Finial Cap */}
        <mesh position={[0, 2.92, 0]} castShadow>
          <boxGeometry args={[0.44, 0.1, 0.44]} />
          <meshStandardMaterial color="#2d1a10" roughness={0.48} />
        </mesh>
        <mesh position={[0, 3.03, 0]} castShadow>
          <boxGeometry args={[0.34, 0.12, 0.34]} />
          <meshStandardMaterial color="#3d2417" roughness={0.45} />
        </mesh>
        {/* Warm Brass Lantern Spire on Top */}
        <mesh position={[0, 3.16, 0]} castShadow>
          <octahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial
            color="#d97706"
            metalness={0.65}
            roughness={0.28}
            emissive="#b45309"
            emissiveIntensity={0.25}
          />
        </mesh>

        {/* Grounded Base Pedestal & Autumn Stones */}
        <mesh position={[0, -2.76, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.36, 0.48, 0.28, 8]} />
          <meshStandardMaterial color="#362115" roughness={0.75} />
        </mesh>
        {/* Earth & Moss Mound */}
        <mesh position={[0, -2.9, 0]} receiveShadow>
          <cylinderGeometry args={[0.85, 1.15, 0.14, 16]} />
          <meshStandardMaterial color="#5c4938" roughness={0.9} />
        </mesh>
        {/* Decorative Waypoint Stones */}
        <mesh position={[-0.45, -2.82, 0.26]} rotation={[0.2, 0.4, 0.1]} castShadow>
          <dodecahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color="#786b5e" roughness={0.85} />
        </mesh>
        <mesh position={[0.48, -2.84, 0.22]} rotation={[-0.1, 0.2, 0.3]} castShadow>
          <dodecahedronGeometry args={[0.13, 0]} />
          <meshStandardMaterial color="#695d52" roughness={0.85} />
        </mesh>
      </group>

      {/* Top Sign: About (North-West Trail) */}
      <DirectionSign
        title="About"
        subtitle="Story, craft & path"
        distance="0.2 km"
        href="/about"
        side="left"
        y={2.02}
        icon="◎"
        phaseOffset={0.0}
        woodBaseColor="#e6d7c3"
        woodHoverColor="#fbf3e6"
        onNavigate={onNavigate}
      />

      {/* Second Sign: Blog (North-East Trail) */}
      <DirectionSign
        title="Blog"
        subtitle="Thoughts & essays"
        distance="0.6 km"
        href="/blog"
        side="right"
        y={0.7}
        icon="▤"
        phaseOffset={1.6}
        woodBaseColor="#decbb4"
        woodHoverColor="#f9efe0"
        onNavigate={onNavigate}
      />

      {/* Third Sign: Projects (South-West Trail) */}
      <DirectionSign
        title="Projects"
        subtitle="Selected works & tools"
        distance="1.2 km"
        href="/projects"
        side="left"
        y={-0.66}
        icon="▣"
        phaseOffset={3.1}
        woodBaseColor="#e3d2bc"
        woodHoverColor="#faf1e4"
        onNavigate={onNavigate}
      />

      {/* Bottom Sign: Contact (South-East Trail) */}
      <DirectionSign
        title="Contact"
        subtitle="Say hello & campfire"
        distance="1.8 km"
        href="/contact"
        side="right"
        y={-1.98}
        icon="✉"
        phaseOffset={4.7}
        woodBaseColor="#dbc7af"
        woodHoverColor="#f8eee0"
        onNavigate={onNavigate}
      />

      {/* Ground contact shadow */}
      <ContactShadows
        position={[0, -2.96, 0]}
        opacity={0.42}
        scale={7.5}
        blur={2.4}
        far={4.2}
      />

      {/* Full 360-degree orbit rotation without azimuth angle clamps */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping={true}
        dampingFactor={0.06}
        rotateSpeed={0.85}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.75}
      />
    </>
  );
}

export default function Signpost3D({
  onNavigate,
  isActiveView = true,
}: Signpost3DProps) {
  return (
    <div className="signpost-scene">
      <Canvas
        frameloop={isActiveView ? 'always' : 'demand'}
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.1, 9.6], fov: 37 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <color attach="background" args={['#f4ecdc']} />
        <Scene onNavigate={onNavigate} />
      </Canvas>
    </div>
  );
}
