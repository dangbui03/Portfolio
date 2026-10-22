
'use client';

import { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Html, OrbitControls } from '@react-three/drei';

import '@/components/css/signpost.css';

type DirectionSignProps = {
  title: string;
  subtitle: string;
  distance: string;
  href: string;
  side: 'left' | 'right';
  y: number;
};

function DirectionSign({
  title,
  subtitle,
  distance,
  href,
  side,
  y,
}: DirectionSignProps) {
  const [hovered, setHovered] = useState(false);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w = 2.7;
    const h = 0.76;
    const tip = 0.32;

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
        bevelSize: 0.025,
        bevelThickness: 0.025,
      }),
    [shape],
  );

  return (
    <group
      position={[side === 'left' ? -1.48 : 1.48, y, 0]}
      rotation={[
        0,
        hovered ? (side === 'left' ? -0.1 : 0.1) : 0,
        side === 'left' ? -0.035 : 0.035,
      ]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* The sign is a genuinely extruded 3D shape */}
      <mesh
        geometry={geometry}
        position={[hovered ? 0 : 0, 0, hovered ? 0.12 : 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={hovered ? '#f5e8d3' : '#dfd1bd'}
          roughness={0.72}
          metalness={0.03}
        />
      </mesh>

      {/* Metal mounting pins */}
      {[-0.17, 0.17].map((pinY) => (
        <mesh
          key={pinY}
          position={[side === 'left' ? 1.12 : -1.12, pinY, 0.17]}
          castShadow
        >
          <cylinderGeometry args={[0.045, 0.045, 0.035, 20]} />
          <meshStandardMaterial
            color="#342219"
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* HTML gives crisp, accessible website text */}
      <Html
        transform
        position={[side === 'left' ? 0.05 : -0.05, 0, 0.19]}
        center
        distanceFactor={1.35}
        style={{ pointerEvents: 'auto' }}
      >
        <a
          className={`sign-label ${hovered ? 'sign-label-active' : ''}`}
          href={href}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          <span className="sign-icon">
            {title === 'About' && '◎'}
            {title === 'Field Notes' && '▤'}
            {title === 'Projects' && '▣'}
            {title === 'Campfire' && '➤'}
          </span>

          <span className="sign-copy">
            <strong>{title}</strong>
            <small>{subtitle}</small>
          </span>

          <span className="sign-distance">{distance}</span>
        </a>
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

      <DirectionSign
        title="About"
        subtitle="Story, craft & path"
        distance="0.2 km"
        href="#about"
        side="left"
        y={2.05}
      />

      <DirectionSign
        title="Field Notes"
        subtitle="Thoughts & essays"
        distance="0.6 km"
        href="#notes"
        side="right"
        y={0.72}
      />

      <DirectionSign
        title="Projects"
        subtitle="Selected works & tools"
        distance="1.2 km"
        href="#projects"
        side="left"
        y={-0.7}
      />

      <DirectionSign
        title="Campfire"
        subtitle="Say hello & guestbook"
        distance="1.8 km"
        href="#campfire"
        side="right"
        y={-2.05}
      />

      {/* Ground shadows */}
      <ContactShadows
        position={[0, -2.95, 0]}
        opacity={0.35}
        scale={7}
        blur={2.5}
        far={4}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.8}
        minAzimuthAngle={-0.35}
        maxAzimuthAngle={0.35}
      />
    </>
  );
}

export default function Signpost3D() {
  return (
    <div className="signpost-scene">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#f4ecdc']} />
        <Scene />
      </Canvas>
    </div>
  );
}
