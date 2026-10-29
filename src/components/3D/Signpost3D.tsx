'use client';

import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';

import '@/components/css/signpost.css';

// Context providing a stable DOM container ref to prevent Drei's <Html> from unmounting during render
const HtmlPortalContext = createContext<React.RefObject<HTMLDivElement | null>>({
  current: null,
});

type DirectionSignProps = {
  title: string;
  subtitle: string;
  distance: string;
  href: string;
  side: 'left' | 'right';
  y: number;
  icon: string;
};

function DirectionSign({
  title,
  subtitle,
  distance,
  href,
  side,
  y,
  icon,
}: DirectionSignProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const portalRef = useContext(HtmlPortalContext);

  // Smooth pendulum sway, tilt, and forward rise on hover
  useFrame((_, delta) => {
    if (groupRef.current) {
      // Smooth pendulum swing rotation on Y
      const targetRotY = hovered ? (side === 'left' ? -0.16 : 0.16) : 0;
      groupRef.current.rotation.y = THREE.MathUtils.damp(
        groupRef.current.rotation.y,
        targetRotY,
        8.5,
        delta,
      );

      // Gentle natural dynamic tilt on Z
      const baseTiltZ = side === 'left' ? -0.025 : 0.025;
      const targetRotZ =
        baseTiltZ + (hovered ? (side === 'left' ? -0.035 : 0.035) : 0);
      groupRef.current.rotation.z = THREE.MathUtils.damp(
        groupRef.current.rotation.z,
        targetRotZ,
        8,
        delta,
      );
    }

    if (meshRef.current) {
      // Tactile forward rise on Z
      const targetZ = hovered ? 0.12 : 0;
      meshRef.current.position.z = THREE.MathUtils.damp(
        meshRef.current.position.z,
        targetZ,
        8.5,
        delta,
      );

      // Smooth material highlight
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      const targetColor = new THREE.Color(hovered ? '#f5e8d3' : '#dfd1bd');
      mat.color.lerp(targetColor, 0.15);
    }
  });

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w = 3.0;
    const h = 0.86;
    const tip = 0.36;

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
        depth: 0.12,
        bevelEnabled: true,
        bevelSegments: 3,
        steps: 1,
        bevelSize: 0.02,
        bevelThickness: 0.02,
      }),
    [shape],
  );

  // Sign label content formatted for directional layout
  const renderLabelContent = (isReverseDirection: boolean = false) => {
    const isPointingLeft =
      (!isReverseDirection && side === 'left') ||
      (isReverseDirection && side === 'right');

    return (
      <Link
        href={href}
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

  return (
    <group
      ref={groupRef}
      position={[side === 'left' ? -1.65 : 1.65, y, 0]}
      rotation={[0, 0, side === 'left' ? -0.025 : 0.025]}
    >
      {/* Extruded 3D wooden sign plank */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#dfd1bd"
          roughness={0.72}
          metalness={0.03}
        />
      </mesh>

      {/* Metal mounting pins fastening plank to the central pole */}
      {[-0.2, 0.2].map((pinY) => (
        <mesh
          key={pinY}
          position={[side === 'left' ? 1.25 : -1.25, pinY, 0.16]}
          castShadow
        >
          <cylinderGeometry args={[0.045, 0.045, 0.04, 20]} />
          <meshStandardMaterial
            color="#342219"
            metalness={0.7}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* FRONT FACE HTML (visible when viewing from front) */}
      <Html
        portal={portalRef as unknown as React.RefObject<HTMLElement>}
        transform
        position={[side === 'left' ? 0.08 : -0.08, 0, 0.18]}
        center
        distanceFactor={1.35}
        className="sign-html-container"
      >
        {renderLabelContent(false)}
      </Html>

      {/* BACK FACE HTML (rotated 180°, visible when camera orbits 360° to the back) */}
      <Html
        portal={portalRef as unknown as React.RefObject<HTMLElement>}
        transform
        position={[side === 'left' ? 0.08 : -0.08, 0, -0.06]}
        rotation={[0, Math.PI, 0]}
        center
        distanceFactor={1.35}
        className="sign-html-container"
      >
        {renderLabelContent(true)}
      </Html>
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.5} />

      <directionalLight
        position={[-4, 7, 6]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight
        position={[4, 2, 3]}
        intensity={35}
        distance={12}
        color="#ffd39a"
      />

      {/* Central wooden post */}
      <mesh position={[0, 0, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 5.7, 0.32]} />
        <meshStandardMaterial color="#4a3023" roughness={0.55} />
      </mesh>

      {/* Top cap */}
      <mesh position={[0, 2.9, -0.12]} castShadow>
        <boxGeometry args={[0.38, 0.13, 0.4]} />
        <meshStandardMaterial color="#332016" roughness={0.45} />
      </mesh>

      {/* Top Sign: About */}
      <DirectionSign
        title="About"
        subtitle="Story, craft & path"
        distance="0.2 km"
        href="/about"
        side="left"
        y={2.05}
        icon="◎"
      />

      {/* Second Sign: Blog */}
      <DirectionSign
        title="Blog"
        subtitle="Thoughts & essays"
        distance="0.6 km"
        href="/blog"
        side="right"
        y={0.72}
        icon="▤"
      />

      {/* Third Sign: Projects */}
      <DirectionSign
        title="Projects"
        subtitle="Selected works & tools"
        distance="1.2 km"
        href="/projects"
        side="left"
        y={-0.7}
        icon="▣"
      />

      {/* Bottom Sign: Contact */}
      <DirectionSign
        title="Contact"
        subtitle="Say hello & campfire"
        distance="1.8 km"
        href="/contact"
        side="right"
        y={-2.05}
        icon="✉"
      />

      {/* Ground contact shadow */}
      <ContactShadows
        position={[0, -2.95, 0]}
        opacity={0.35}
        scale={7}
        blur={2.5}
        far={4}
      />

      {/* Full 360-degree orbit rotation without azimuth angle clamps */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableDamping={true}
        dampingFactor={0.06}
        rotateSpeed={0.85}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
      />
    </>
  );
}

export default function Signpost3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="signpost-scene">
      <HtmlPortalContext.Provider value={containerRef}>
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 10], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#f4ecdc']} />
          <Scene />
        </Canvas>
      </HtmlPortalContext.Provider>
    </div>
  );
}
