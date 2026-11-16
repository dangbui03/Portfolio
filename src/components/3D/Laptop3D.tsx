'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { ContactShadows, OrbitControls, PerspectiveCamera, RoundedBox } from '@react-three/drei';

export type LaptopBrandId = 'apple' | 'thinkpad' | 'rog' | 'hp';

/** Real-market factory colorway for a laptop model. */
export interface LaptopColorway {
  id: string;
  name: string;
  /** CSS background used by the customizer swatch. */
  swatch: string;
  shellColor: string;
  deckColor: string;
  keyColor: string;
  logoColor: string;
  ledColor: string;
  metalness: number;
  roughness: number;
  /** ThinkPad carbon-fiber weave finish. */
  weave?: boolean;
}

export interface LaptopBrandConfig {
  id: LaptopBrandId;
  name: string;
  tagline: string;
  bezelColor: string;
  colorways: LaptopColorway[];
}

export const LAPTOP_BRANDS: Record<LaptopBrandId, LaptopBrandConfig> = {
  apple: {
    id: 'apple',
    name: 'Macbook Pro',
    tagline: 'M-series · Unibody Slab',
    bezelColor: '#0c0d10',
    colorways: [
      {
        id: 'space-black',
        name: 'Space Black',
        swatch: '#3c3f46',
        shellColor: '#3c3f46',
        deckColor: '#43474f',
        keyColor: '#1f2229',
        logoColor: '#e2e4e9',
        ledColor: '#f5f5f7',
        metalness: 0.68,
        roughness: 0.28,
      },
      {
        id: 'space-gray',
        name: 'Space Gray',
        swatch: '#7c8087',
        shellColor: '#7c8087',
        deckColor: '#74787f',
        keyColor: '#1d2026',
        logoColor: '#f1f3f6',
        ledColor: '#f5f5f7',
        metalness: 0.74,
        roughness: 0.26,
      },
      {
        id: 'silver',
        name: 'Silver',
        swatch: '#e3e4e6',
        shellColor: '#e3e4e6',
        deckColor: '#dcdde0',
        keyColor: '#1d2026',
        logoColor: '#5c616b',
        ledColor: '#f5f5f7',
        metalness: 0.78,
        roughness: 0.22,
      },
      {
        id: 'midnight',
        name: 'Midnight',
        swatch: '#2f3b4e',
        shellColor: '#2f3b4e',
        deckColor: '#354257',
        keyColor: '#1b222e',
        logoColor: '#dce3ee',
        ledColor: '#f5f5f7',
        metalness: 0.66,
        roughness: 0.28,
      },
      {
        id: 'starlight',
        name: 'Starlight',
        swatch: '#e6dfd3',
        shellColor: '#e6dfd3',
        deckColor: '#ded7ca',
        keyColor: '#1f2229',
        logoColor: '#787168',
        ledColor: '#f5f5f7',
        metalness: 0.74,
        roughness: 0.24,
      },
      {
        id: 'sky-blue',
        name: 'Sky Blue',
        swatch: '#bfd4e6',
        shellColor: '#bfd4e6',
        deckColor: '#b5cbe0',
        keyColor: '#1f2229',
        logoColor: '#4b5c6e',
        ledColor: '#f5f5f7',
        metalness: 0.74,
        roughness: 0.24,
      },
    ],
  },
  thinkpad: {
    id: 'thinkpad',
    name: 'Thinkpad P1',
    tagline: 'Gen 7 · Satin Workstation',
    bezelColor: '#121418',
    colorways: [
      {
        id: 'black-weave',
        name: 'Carbon Satin Black',
        swatch:
          'repeating-linear-gradient(45deg, #353840 0 3px, #454952 3px 6px)',
        shellColor: '#373a42',
        deckColor: '#3e424b',
        keyColor: '#22252c',
        logoColor: '#e4e4e7',
        ledColor: '#f4f4f5',
        metalness: 0.46,
        roughness: 0.34,
        weave: true,
      },
      {
        id: 'black-satin',
        name: 'Graphite Metallic',
        swatch: '#464a54',
        shellColor: '#464a54',
        deckColor: '#4c515c',
        keyColor: '#242830',
        logoColor: '#f1f5f9',
        ledColor: '#f4f4f5',
        metalness: 0.54,
        roughness: 0.28,
      },
      {
        id: 'storm-silver',
        name: 'Storm Silver',
        swatch: '#c4cad4',
        shellColor: '#c4cad4',
        deckColor: '#bcc3ce',
        keyColor: '#232730',
        logoColor: '#1f232b',
        ledColor: '#f8fafc',
        metalness: 0.74,
        roughness: 0.24,
      },
    ],
  },
  rog: {
    id: 'rog',
    name: 'Asus Zephyrus',
    tagline: 'ROG · Light Blue LED & Slash',
    bezelColor: '#0e1015',
    colorways: [
      {
        id: 'eclipse-gray',
        name: 'Eclipse Gray',
        swatch: '#464b55',
        shellColor: '#464b55',
        deckColor: '#4d535e',
        keyColor: '#252932',
        logoColor: '#7dd3fc',
        ledColor: '#7dd3fc',
        metalness: 0.64,
        roughness: 0.3,
      },
      {
        id: 'platinum-white',
        name: 'Platinum White',
        swatch: '#e7e7e4',
        shellColor: '#e7e7e4',
        deckColor: '#deded9',
        keyColor: '#ececea',
        logoColor: '#7dd3fc',
        ledColor: '#7dd3fc',
        metalness: 0.62,
        roughness: 0.28,
      },
    ],
  },
  hp: {
    id: 'hp',
    name: 'HP OmniBook',
    tagline: 'Ultra 14 · AI PC',
    bezelColor: '#101318',
    colorways: [
      {
        id: 'atmospheric-blue',
        name: 'Atmospheric Blue',
        swatch: '#2b425b',
        shellColor: '#2b425b',
        deckColor: '#334d68',
        keyColor: '#1e2e40',
        logoColor: '#e2e8f0',
        ledColor: '#e0f2fe',
        metalness: 0.68,
        roughness: 0.28,
      },
      {
        id: 'glacier-silver',
        name: 'Glacier Silver',
        swatch: '#d6dbe2',
        shellColor: '#d6dbe2',
        deckColor: '#cdd3dc',
        keyColor: '#262b34',
        logoColor: '#181b22',
        ledColor: '#f8fafc',
        metalness: 0.76,
        roughness: 0.24,
      },
      {
        id: 'meteor-black',
        name: 'Meteor Black',
        swatch: '#3d414a',
        shellColor: '#3d414a',
        deckColor: '#454a54',
        keyColor: '#232730',
        logoColor: '#1d4ed8',
        ledColor: '#f8fafc',
        metalness: 0.64,
        roughness: 0.3,
      },
    ],
  },
};

export function getLaptopColorway(
  brand: LaptopBrandId,
  colorwayId?: string | null,
): LaptopColorway {
  const { colorways } = LAPTOP_BRANDS[brand];
  return colorways.find((c) => c.id === colorwayId) ?? colorways[0];
}

/**
 * Default hardcoded wallpaper.
 * Replace `DEFAULT_WALLPAPER_URL` or pass `wallpaperUrl` prop later to load an S3 image.
 */
export const DEFAULT_WALLPAPER_URL = '';

export interface Laptop3DProps {
  brand: LaptopBrandId;
  colorwayId?: string | null;
  wallpaperUrl?: string;
  isLidOpen: boolean;
  isScreenOn: boolean;
  isDialogOpen: boolean;
  onToggleLid: () => void;
  onScreenWallpaperClick: () => void;
}

function makeCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) draw(ctx);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a crisp hardcoded desktop wallpaper texture on an offscreen canvas.
 */
function createHardcodedWallpaperTexture(): THREE.CanvasTexture {
  return makeCanvasTexture(1280, 800, (ctx) => {
    const sky = ctx.createLinearGradient(0, 0, 1280, 800);
    sky.addColorStop(0, '#0f172a');
    sky.addColorStop(0.45, '#1e293b');
    sky.addColorStop(0.78, '#334155');
    sky.addColorStop(1, '#ea580c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1280, 800);

    const sunGrad = ctx.createRadialGradient(890, 270, 20, 890, 270, 230);
    sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.96)');
    sunGrad.addColorStop(0.35, 'rgba(249, 115, 22, 0.55)');
    sunGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(890, 270, 230, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(890, 270, 68, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(248, 250, 252, 0.55)';
    const starCoords = [
      [140, 110],
      [280, 180],
      [420, 95],
      [590, 150],
      [710, 88],
      [1080, 130],
      [1160, 210],
      [210, 270],
    ];
    for (const [sx, sy] of starCoords) {
      ctx.beginPath();
      ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, 560);
    ctx.lineTo(240, 405);
    ctx.lineTo(480, 515);
    ctx.lineTo(740, 360);
    ctx.lineTo(1010, 495);
    ctx.lineTo(1280, 385);
    ctx.lineTo(1280, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 625);
    ctx.lineTo(310, 490);
    ctx.lineTo(590, 590);
    ctx.lineTo(860, 465);
    ctx.lineTo(1140, 575);
    ctx.lineTo(1280, 515);
    ctx.lineTo(1280, 800);
    ctx.lineTo(0, 800);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(0, 0, 1280, 42);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 18px system-ui, -apple-system, sans-serif';
    ctx.fillText('PORTFOLIO OS // 2.4', 28, 27);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('ONLINE · CLICK WALLPAPER', 1252, 27);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
    ctx.lineWidth = 2;
    const badgeW = 420;
    const badgeH = 74;
    const badgeX = (1280 - badgeW) / 2;
    const badgeY = 635;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('TAP SCREEN TO OPEN MENU', 640, 672);
    ctx.fillStyle = '#fb923c';
    ctx.font = '600 14px monospace';
    ctx.fillText('PROFILE · PROJECTS · BLOG · CONTACT', 640, 696);
  });
}

/** Subtle grayscale carbon-fiber twill weave, multiplied over the shell color. */
function createCarbonWeaveTexture(): THREE.CanvasTexture {
  const texture = makeCanvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = '#e2e2e2';
    ctx.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 8) {
      for (let x = 0; x < 64; x += 8) {
        const horizontal = ((x + y) / 8) % 2 === 0;
        const grad = horizontal
          ? ctx.createLinearGradient(x, y, x, y + 8)
          : ctx.createLinearGradient(x, y, x + 8, y);
        grad.addColorStop(0, '#c8c8c8');
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, '#c8c8c8');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 0.5, y + 0.5, 7, 7);
      }
    }
  });
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 10);
  return texture;
}

/**
 * Declarative responsive camera memoized by viewport tier so re-renders
 * never reset the user's 360° OrbitControls angle.
 */
const ResponsiveCameraRig = React.memo(function ResponsiveCameraRig() {
  const size = useThree((state) => state.size);
  const aspect = size.width / Math.max(1, size.height);
  const tier =
    size.width < 520
      ? 'sm'
      : size.width < 900 || aspect < 1.05
        ? 'md'
        : 'lg';

  const cameraProps = useMemo<{
    position: [number, number, number];
    fov: number;
  }>(() => {
    if (tier === 'sm') return { position: [0, 2.0, 6.9], fov: 38 };
    if (tier === 'md') return { position: [0, 1.8, 6.1], fov: 36 };
    return { position: [0, 1.55, 5.4], fov: 34 };
  }, [tier]);

  return (
    <PerspectiveCamera
      makeDefault
      position={cameraProps.position}
      fov={cameraProps.fov}
      near={0.1}
      far={100}
    />
  );
});

/* ================================================================
   KEYBOARD LAYOUT (6 real rows: Fn / numbers / QWERTY / ASDF / ZXCV / bottom)
   ================================================================ */

interface KeySpec {
  x: number;
  z: number;
  w: number;
  d: number;
}

const KEY_UNIT = 0.14;
const KEY_GAP = 0.02;
const KEY_ROW_WIDTH = 15 * KEY_UNIT;

const KEY_ROWS: Array<{ z: number; d: number; units: number[] }> = [
  { z: -0.52, d: 0.065, units: Array(14).fill(15 / 14) },
  { z: -0.4, d: 0.1, units: [...Array(13).fill(1), 2] },
  { z: -0.28, d: 0.1, units: [1.5, ...Array(12).fill(1), 1.5] },
  { z: -0.16, d: 0.1, units: [1.75, ...Array(11).fill(1), 2.25] },
  { z: -0.04, d: 0.1, units: [2.25, ...Array(10).fill(1), 2.75] },
  { z: 0.08, d: 0.1, units: [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1] },
];

// TrackPoint sits at the junction of G / H / B
const TRACKPOINT_X = -KEY_ROW_WIDTH / 2 + 6.75 * KEY_UNIT;
const TRACKPOINT_Z = -0.1;

function buildKeyLayout(brand: LaptopBrandId): {
  keys: KeySpec[];
  wasdKeys: KeySpec[];
  specialKey: KeySpec | null;
} {
  const keys: KeySpec[] = [];
  const wasdKeys: KeySpec[] = [];
  let specialKey: KeySpec | null = null;
  const isThinkPad = brand === 'thinkpad';
  const isRog = brand === 'rog';

  KEY_ROWS.forEach((row, rIdx) => {
    let cursor = -KEY_ROW_WIDTH / 2;
    row.units.forEach((u, cIdx) => {
      const spec: KeySpec = {
        x: cursor + (u * KEY_UNIT) / 2,
        z: row.z,
        w: u * KEY_UNIT - KEY_GAP,
        d: row.d,
      };
      cursor += u * KEY_UNIT;

      // Touch ID (Macbook) / Fingerprint power button (ThinkPad) at Fn-row end
      const isLastFnKey = rIdx === 0 && cIdx === row.units.length - 1;
      if (isLastFnKey && (brand === 'apple' || isThinkPad)) {
        specialKey = spec;
        return;
      }

      // Asus Zephyrus: separate W (row 2, col 2) and A, S, D (row 3, cols 1..3)
      const isWasdKey =
        isRog &&
        ((rIdx === 2 && cIdx === 2) ||
          (rIdx === 3 && (cIdx === 1 || cIdx === 2 || cIdx === 3)));
      if (isWasdKey) {
        wasdKeys.push(spec);
        return;
      }

      // ThinkPad: notch G, H and B keys to make room for the red TrackPoint
      if (isThinkPad && rIdx === 3 && (cIdx === 5 || cIdx === 6)) {
        spec.d -= 0.016;
        spec.z -= 0.008;
      }
      if (isThinkPad && rIdx === 4 && cIdx === 5) {
        spec.d -= 0.016;
        spec.z += 0.008;
      }

      keys.push(spec);
    });
  });

  return { keys, wasdKeys, specialKey };
}

/**
 * Backlit LED keyboard deck tailored to each laptop model's real hardware layout.
 */
function KeyboardDeck({
  brand,
  colorway,
  isKeyboardLit,
}: {
  brand: LaptopBrandId;
  colorway: LaptopColorway;
  isKeyboardLit: boolean;
}) {
  const ledLevelRef = useRef(0);
  const wellLedMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const keyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const wasdMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const trackpadLedMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const keysMeshRef = useRef<THREE.InstancedMesh>(null);
  const wasdMeshRef = useRef<THREE.InstancedMesh>(null);

  const isMac = brand === 'apple';
  const isThinkPad = brand === 'thinkpad';
  const isRog = brand === 'rog';
  const isHp = brand === 'hp';
  const isLightKeys = colorway.id === 'platinum-white';

  const { keys, wasdKeys, specialKey } = useMemo(() => buildKeyLayout(brand), [brand]);

  // Layout effect so instances are positioned before the first frame renders
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    const mesh = keysMeshRef.current;
    if (mesh) {
      keys.forEach((k, idx) => {
        dummy.position.set(k.x, 0.008, k.z);
        dummy.scale.set(k.w, 0.014, k.d);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }

    const wasdMesh = wasdMeshRef.current;
    if (wasdMesh && wasdKeys.length > 0) {
      wasdKeys.forEach((k, idx) => {
        dummy.position.set(k.x, 0.009, k.z);
        dummy.scale.set(k.w, 0.015, k.d);
        dummy.updateMatrix();
        wasdMesh.setMatrixAt(idx, dummy.matrix);
      });
      wasdMesh.instanceMatrix.needsUpdate = true;
      wasdMesh.computeBoundingSphere();
    }
  }, [keys, wasdKeys, colorway.id]);

  useEffect(() => {
    if (wellLedMatRef.current) wellLedMatRef.current.emissiveIntensity = 0;
    if (keyMatRef.current) keyMatRef.current.emissiveIntensity = 0;
    if (wasdMatRef.current) wasdMatRef.current.emissiveIntensity = 0;
    if (trackpadLedMatRef.current) trackpadLedMatRef.current.emissiveIntensity = 0;
  }, [brand, colorway.id]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();
    ledLevelRef.current = THREE.MathUtils.lerp(
      ledLevelRef.current,
      isKeyboardLit ? 1 : 0,
      1 - Math.exp(-10 * dt),
    );
    const lvl = ledLevelRef.current;

    if (wellLedMatRef.current) {
      wellLedMatRef.current.emissiveIntensity = lvl * (isRog ? 1.15 : 0.78);
    }
    if (keyMatRef.current) {
      keyMatRef.current.emissiveIntensity =
        lvl * (isRog ? 0.36 : isLightKeys ? 0.12 : 0.26);
    }
    if (wasdMatRef.current) {
      const pulse = 0.88 + Math.sin(t * 2.8) * 0.12;
      wasdMatRef.current.emissiveIntensity = Math.max(0.22, lvl * 1.1 * pulse);
    }
    if (trackpadLedMatRef.current) {
      const pulse = 0.85 + Math.cos(t * 2.4) * 0.15;
      trackpadLedMatRef.current.emissiveIntensity = Math.max(0.16, lvl * 1.05 * pulse);
    }
  });

  const touchpad = isMac
    ? { w: 1.12, d: 0.56, z: 0.47 }
    : isThinkPad
      ? { w: 0.82, d: 0.4, z: 0.5 }
      : isRog
        ? { w: 1.04, d: 0.53, z: 0.47 }
        : { w: 0.98, d: 0.5, z: 0.47 };

  // Subtle contrast rim around trackpad so interior hardware is always visible
  const trackpadRimColor = isRog
    ? '#7dd3fc'
    : isThinkPad
      ? '#525866'
      : '#64748b';

  return (
    <group position={[0, 0.046, 0.02]}>
      {/* Recessed keyboard well with LED underglow */}
      <mesh position={[0, -0.002, -0.21]} receiveShadow>
        <boxGeometry args={[KEY_ROW_WIDTH + 0.04, 0.01, 0.73]} />
        <meshStandardMaterial
          ref={wellLedMatRef}
          color="#101318"
          roughness={0.7}
          emissive={colorway.ledColor}
        />
      </mesh>

      {/* Instanced backlit keycaps (keyed by brand only so color changes never reset matrices) */}
      <instancedMesh
        key={`keys-${brand}`}
        ref={keysMeshRef}
        args={[undefined, undefined, keys.length]}
        castShadow
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={keyMatRef}
          color={colorway.keyColor}
          metalness={0.16}
          roughness={isThinkPad ? 0.52 : 0.4}
          emissive={colorway.ledColor}
        />
      </instancedMesh>

      {/* Asus Zephyrus: Distinct light-blue highlighted WASD keycaps */}
      {isRog && wasdKeys.length > 0 && (
        <instancedMesh
          key={`wasd-${brand}`}
          ref={wasdMeshRef}
          args={[undefined, undefined, wasdKeys.length]}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            ref={wasdMatRef}
            color={isLightKeys ? '#7dd3fc' : '#bae6fd'}
            metalness={0.22}
            roughness={0.24}
            emissive="#7dd3fc"
          />
        </instancedMesh>
      )}

      {/* Macbook Touch ID key / ThinkPad fingerprint power button */}
      {specialKey && (
        <group position={[specialKey.x, 0.008, specialKey.z]}>
          <mesh>
            <boxGeometry args={[specialKey.w, 0.014, specialKey.d]} />
            <meshStandardMaterial
              color={colorway.keyColor}
              metalness={0.35}
              roughness={0.22}
            />
          </mesh>
          {isMac && (
            <mesh position={[0, 0.0075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.022, 0.026, 32]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
          )}
          {isThinkPad && (
            <mesh position={[specialKey.w / 2 - 0.018, 0.008, 0]}>
              <sphereGeometry args={[0.006, 10, 10]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={isKeyboardLit ? 1.2 : 0.2}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Macbook Pro: speaker grilles flanking the keyboard */}
      {isMac &&
        [-1.18, 1.18].map((sx) => (
          <mesh key={sx} position={[sx, 0.001, -0.21]}>
            <boxGeometry args={[0.12, 0.004, 0.7]} />
            <meshStandardMaterial color="#1f232b" roughness={0.75} />
          </mesh>
        ))}

      {/* HP OmniBook: full-width speaker grille above the keyboard */}
      {isHp && (
        <mesh position={[0, 0.001, -0.63]}>
          <boxGeometry args={[KEY_ROW_WIDTH, 0.004, 0.06]} />
          <meshStandardMaterial color="#1e2430" roughness={0.75} />
        </mesh>
      )}

      {/* ThinkPad P1: red TrackPoint + 3 physical buttons with red stripes */}
      {isThinkPad && (
        <>
          <mesh position={[TRACKPOINT_X, 0.014, TRACKPOINT_Z]}>
            <cylinderGeometry args={[0.02, 0.022, 0.02, 20]} />
            <meshStandardMaterial
              color="#e11d48"
              emissive="#e11d48"
              emissiveIntensity={0.25}
              roughness={0.5}
            />
          </mesh>

          <group position={[0, 0.004, 0.205]}>
            {[-0.27, 0, 0.27].map((bx) => (
              <mesh key={bx} position={[bx, 0, 0]}>
                <boxGeometry args={[bx === 0 ? 0.22 : 0.3, 0.01, 0.065]} />
                <meshStandardMaterial color="#252830" roughness={0.5} />
              </mesh>
            ))}
            {[-0.115, 0.115].map((rx) => (
              <mesh key={rx} position={[rx, 0.0055, 0]}>
                <boxGeometry args={[0.008, 0.002, 0.06]} />
                <meshStandardMaterial color="#e11d48" roughness={0.4} />
              </mesh>
            ))}
          </group>
        </>
      )}

      {/* Touchpad with chamfered/LED rim so it stands out on all colorways */}
      <group position={[0, 0.001, touchpad.z]}>
        {/* Outer rim / Asus Zephyrus glowing light-blue LED trackpad border */}
        <mesh position={[0, -0.0005, 0]}>
          <boxGeometry args={[touchpad.w + 0.022, 0.006, touchpad.d + 0.022]} />
          {isRog ? (
            <meshStandardMaterial
              ref={trackpadLedMatRef}
              color="#7dd3fc"
              emissive="#7dd3fc"
              roughness={0.2}
            />
          ) : (
            <meshStandardMaterial
              color={trackpadRimColor}
              metalness={0.6}
              roughness={0.3}
            />
          )}
        </mesh>

        {/* Main touchpad glass surface */}
        <mesh position={[0, 0.0005, 0]} receiveShadow>
          <boxGeometry args={[touchpad.w, 0.006, touchpad.d]} />
          <meshStandardMaterial
            color={isThinkPad ? '#2c3039' : colorway.deckColor}
            metalness={isThinkPad ? 0.32 : colorway.metalness * 0.85}
            roughness={isThinkPad ? 0.36 : 0.2}
          />
        </mesh>

        {/* Asus Zephyrus: subtle glowing light-blue accent lines inside trackpad */}
        {isRog && (
          <>
            <mesh position={[0, 0.004, -touchpad.d / 2 + 0.025]}>
              <boxGeometry args={[touchpad.w * 0.55, 0.001, 0.008]} />
              <meshStandardMaterial
                color="#bae6fd"
                emissive="#7dd3fc"
                emissiveIntensity={isKeyboardLit ? 1.15 : 0.22}
              />
            </mesh>
            <mesh position={[0, 0.004, touchpad.d / 2 - 0.025]}>
              <boxGeometry args={[touchpad.w * 0.55, 0.001, 0.008]} />
              <meshStandardMaterial
                color="#bae6fd"
                emissive="#7dd3fc"
                emissiveIntensity={isKeyboardLit ? 1.15 : 0.22}
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

/* ================================================================
   LID BRAND EMBLEMS (real-market placement)
   ================================================================ */

const LID_DECAL_ROTATION: [number, number, number] = [-Math.PI / 2, 0, Math.PI];
const LID_SURFACE_Y = 0.0615;

/** ThinkPad wordmark (red i-dot), i-dot glow mask and Lenovo tag textures. */
function createThinkPadLidTextures(logoColor: string) {
  const baseline = 100;
  const dotY = baseline - 66;
  const x0 = 24;

  const measureCtx = document.createElement('canvas').getContext('2d');
  let wTh = 150;
  let wI = 24;
  if (measureCtx) {
    measureCtx.font = '700 84px "Helvetica Neue", Arial, sans-serif';
    wTh = measureCtx.measureText('Th').width;
    wI = measureCtx.measureText('\u0131').width;
  }
  const dotX = x0 + wTh + wI / 2;

  const logoMap = makeCanvasTexture(512, 128, (ctx) => {
    ctx.font = '700 84px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = logoColor;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Th', x0, baseline);
    ctx.fillText('\u0131', x0 + wTh, baseline);
    ctx.fillText('nkPad', x0 + wTh + wI, baseline);
    ctx.fillStyle = '#e4002b';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  const dotMap = makeCanvasTexture(512, 128, (ctx) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(dotX, dotY, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  const lenovoMap = makeCanvasTexture(256, 64, (ctx) => {
    ctx.font = '600 40px "Helvetica Neue", Arial, sans-serif';
    ctx.fillStyle = logoColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Lenovo', 128, 34);
  });

  return { logoMap, dotMap, lenovoMap };
}

function ThinkPadLidBadges({
  colorway,
  isPoweredOn,
}: {
  colorway: LaptopColorway;
  isPoweredOn: boolean;
}) {
  const { logoMap, dotMap, lenovoMap } = useMemo(
    () => createThinkPadLidTextures(colorway.logoColor),
    [colorway.logoColor],
  );

  useEffect(() => {
    return () => {
      logoMap.dispose();
      dotMap.dispose();
      lenovoMap.dispose();
    };
  }, [logoMap, dotMap, lenovoMap]);

  return (
    <>
      {/* ThinkPad wordmark at top-left corner, tilted 30°, with red status LED dot underneath */}
      <group
        position={[0.88, LID_SURFACE_Y, 1.42]}
        rotation={[0, -Math.PI / 6, 0]}
      >
        <mesh rotation={LID_DECAL_ROTATION}>
          <planeGeometry args={[0.44, 0.11]} />
          <meshStandardMaterial
            map={logoMap}
            emissive="#ff1a3c"
            emissiveMap={dotMap}
            emissiveIntensity={isPoweredOn ? 1.8 : 0.2}
            transparent
            alphaTest={0.3}
            metalness={0.4}
            roughness={0.35}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>

        {/* Dedicated red power indicator dot directly below the ThinkPad logo */}
        <mesh position={[0, 0.003, -0.068]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshStandardMaterial
            color={isPoweredOn ? '#ff1a3c' : '#4c0519'}
            emissive="#ff1a3c"
            emissiveIntensity={isPoweredOn ? 2.4 : 0.08}
            roughness={0.25}
          />
        </mesh>
      </group>

      {/* Lenovo tag at opposite bottom-right corner */}
      <mesh position={[-0.96, LID_SURFACE_Y, 0.22]} rotation={LID_DECAL_ROTATION}>
        <planeGeometry args={[0.2, 0.05]} />
        <meshStandardMaterial
          map={lenovoMap}
          transparent
          alphaTest={0.3}
          metalness={0.5}
          roughness={0.35}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
    </>
  );
}

/**
 * HP OmniBook 4-slash minimalist logo combining Black, Silver, and Deep Blue.
 */
function HpOmniBookLidLogo({ colorway }: { colorway: LaptopColorway }) {
  const isSilverShell = colorway.id === 'glacier-silver';
  const isBlueShell = colorway.id === 'atmospheric-blue';

  // Combine Black (#181b22), Silver (#f1f5f9) and Deep Blue (#1d4ed8) across the 4 strokes & medallion
  const outerSlashColor = isSilverShell
    ? '#181b22' // Black chrome on silver shell
    : '#f1f5f9'; // Silver chrome on dark/blue shells
  const innerSlashColor = isBlueShell
    ? '#93c5fd' // Ice-sapphire blue on blue shell
    : '#1d4ed8'; // Deep sapphire blue on silver/black shells
  const plateColor = isSilverShell ? '#1e293b' : '#111827';

  return (
    <group position={[0, 0.06, 0.86]}>
      {/* Subtle deep-blue & black recessed medallion base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <ringGeometry args={[0.135, 0.16, 36]} />
        <meshStandardMaterial color="#1d4ed8" metalness={0.65} roughness={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.0015, 0]}>
        <circleGeometry args={[0.136, 36]} />
        <meshStandardMaterial color={plateColor} metalness={0.45} roughness={0.35} />
      </mesh>

      {/* Iconic HP 4-slash strokes (////) in Silver, Deep Blue, and Black */}
      <group rotation={[0, 0.34, 0]} position={[0, 0.0025, 0]}>
        <mesh position={[-0.063, 0, 0.016]}>
          <boxGeometry args={[0.022, 0.005, 0.145]} />
          <meshStandardMaterial color={outerSlashColor} metalness={0.6} roughness={0.18} />
        </mesh>
        <mesh position={[-0.021, 0, -0.014]}>
          <boxGeometry args={[0.022, 0.005, 0.19]} />
          <meshStandardMaterial color={innerSlashColor} metalness={0.55} roughness={0.2} />
        </mesh>
        <mesh position={[0.021, 0, 0.014]}>
          <boxGeometry args={[0.022, 0.005, 0.19]} />
          <meshStandardMaterial color={outerSlashColor} metalness={0.6} roughness={0.18} />
        </mesh>
        <mesh position={[0.063, 0, -0.016]}>
          <boxGeometry args={[0.022, 0.005, 0.145]} />
          <meshStandardMaterial color={innerSlashColor} metalness={0.55} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

function AppleLidLogo({
  colorway,
  yOffset = 0.0595,
}: {
  colorway: LaptopColorway;
  yOffset?: number;
}) {
  const appleBodyGeometry = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.105);
    s.bezierCurveTo(0.045, -0.125, 0.105, -0.08, 0.115, -0.01);
    s.bezierCurveTo(0.125, 0.065, 0.07, 0.11, 0.025, 0.095);
    s.bezierCurveTo(0.008, 0.088, -0.008, 0.088, -0.025, 0.095);
    s.bezierCurveTo(-0.06, 0.108, -0.095, 0.085, -0.108, 0.055);
    s.bezierCurveTo(-0.072, 0.035, -0.072, -0.025, -0.112, -0.045);
    s.bezierCurveTo(-0.095, -0.095, -0.045, -0.125, 0, -0.105);
    s.closePath();

    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.003, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0.003, 0);
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      appleBodyGeometry.dispose();
    };
  }, [appleBodyGeometry]);

  return (
    <group position={[0, yOffset, 0.86]}>
      <mesh geometry={appleBodyGeometry}>
        <meshStandardMaterial
          color={colorway.logoColor}
          metalness={0.35}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[-0.015, 0.002, 0.135]} rotation={[-Math.PI / 2, 0, 0.55]}>
        <capsuleGeometry args={[0.016, 0.038, 4, 8]} />
        <meshStandardMaterial
          color={colorway.logoColor}
          metalness={0.35}
          roughness={0.22}
        />
      </mesh>
    </group>
  );
}

function ZephyrusSlash({
  colorway,
  isPoweredOn,
}: {
  colorway: LaptopColorway;
  isPoweredOn: boolean;
}) {
  const slashOffsets = [-0.66, -0.5, -0.34, -0.18, -0.02, 0.14, 0.3, 0.46, 0.62];
  const channelColor = useMemo(
    () => `#${new THREE.Color(colorway.shellColor).multiplyScalar(0.55).getHexString()}`,
    [colorway.shellColor],
  );

  return (
    <group position={[0, 0.0605, 0.86]}>
      <group rotation={[0, 0.52, 0]}>
        <mesh>
          <boxGeometry args={[1.66, 0.002, 0.056]} />
          <meshStandardMaterial color={channelColor} roughness={0.45} metalness={0.4} />
        </mesh>
        {slashOffsets.map((sx) => (
          <mesh key={sx} position={[sx, 0.002, 0]}>
            <boxGeometry args={[0.1, 0.0025, 0.024]} />
            <meshStandardMaterial
              color="#e0f2fe"
              emissive="#7dd3fc"
              emissiveIntensity={isPoweredOn ? 1.5 : 0.28}
            />
          </mesh>
        ))}
      </group>

      {/* ROG corner light-blue badge */}
      <mesh position={[-0.96, 0.002, 0.58]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.11, 0.005, 0.11]} />
        <meshStandardMaterial
          color="#bae6fd"
          emissive="#7dd3fc"
          emissiveIntensity={isPoweredOn ? 1.2 : 0.32}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function LaptopModel({
  brand,
  colorwayId,
  wallpaperUrl,
  isLidOpen,
  isScreenOn,
  isDialogOpen,
  onToggleLid,
  onScreenWallpaperClick,
}: Laptop3DProps) {
  const brandConfig = LAPTOP_BRANDS[brand];
  const colorway = getLaptopColorway(brand, colorwayId);
  const isMac = brand === 'apple';
  const isThinkPad = brand === 'thinkpad';
  const isRog = brand === 'rog';
  const isHp = brand === 'hp';

  const laptopRootRef = useRef<THREE.Group>(null);
  const hingeRef = useRef<THREE.Group>(null);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const hingeVelRef = useRef(0);
  const currentPowerRef = useRef(0);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const fallbackWallpaper = useMemo(() => createHardcodedWallpaperTexture(), []);
  const carbonWeave = useMemo(() => createCarbonWeaveTexture(), []);
  const screenOffColor = useMemo(() => new THREE.Color('#06080c'), []);
  const screenOnColor = useMemo(() => new THREE.Color('#ffffff'), []);
  const normalizedUrl = (wallpaperUrl ?? DEFAULT_WALLPAPER_URL).trim();
  const [loadedWallpaper, setLoadedWallpaper] = useState<{
    url: string;
    texture: THREE.Texture;
  } | null>(null);

  useEffect(() => {
    if (!normalizedUrl) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      normalizedUrl,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        setLoadedWallpaper({ url: normalizedUrl, texture: tex });
      },
      undefined,
      () => {
        if (!cancelled) setLoadedWallpaper(null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [normalizedUrl]);

  useEffect(() => {
    return () => {
      fallbackWallpaper.dispose();
      carbonWeave.dispose();
    };
  }, [fallbackWallpaper, carbonWeave]);

  useEffect(() => {
    const textureToDispose = loadedWallpaper?.texture;
    return () => {
      if (textureToDispose) {
        textureToDispose.dispose();
      }
    };
  }, [loadedWallpaper]);

  useEffect(() => {
    if (screenMatRef.current) {
      screenMatRef.current.color.copy(screenOffColor);
      screenMatRef.current.emissiveIntensity = 0;
      screenMatRef.current.roughness = 0.08;
    }
  }, [screenOffColor]);

  useEffect(() => {
    document.body.style.cursor = isHovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isHovered]);

  const activeWallpaper =
    loadedWallpaper && loadedWallpaper.url === normalizedUrl
      ? loadedWallpaper.texture
      : fallbackWallpaper;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.getElapsedTime();

    if (hingeRef.current) {
      const targetAngle = isLidOpen ? -1.86 : 0;
      const stiffness = isLidOpen ? 95 : 120;
      const damping = isLidOpen ? 13 : 16;
      const force = (targetAngle - hingeRef.current.rotation.x) * stiffness;
      hingeVelRef.current += force * dt;
      hingeVelRef.current *= Math.exp(-damping * dt);
      hingeRef.current.rotation.x += hingeVelRef.current * dt;
    }

    if (laptopRootRef.current) {
      const targetY =
        (isDialogOpen ? -0.02 : Math.sin(t * 1.4) * 0.018) +
        (isHovered ? 0.022 : 0);
      laptopRootRef.current.position.y = THREE.MathUtils.lerp(
        laptopRootRef.current.position.y,
        targetY,
        0.1,
      );
    }

    currentPowerRef.current = THREE.MathUtils.lerp(
      currentPowerRef.current,
      isLidOpen && isScreenOn ? 1 : 0,
      0.14,
    );

    if (screenMatRef.current) {
      screenMatRef.current.color.lerpColors(
        screenOffColor,
        screenOnColor,
        currentPowerRef.current,
      );
      screenMatRef.current.emissiveIntensity = currentPowerRef.current * 0.92;
      screenMatRef.current.roughness = THREE.MathUtils.lerp(
        0.08,
        0.26,
        currentPowerRef.current,
      );
    }
  });

  const recordPointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const isCleanClick = (e: ThreeEvent<MouseEvent>) => {
    if (!pointerDownRef.current) return true;
    const dx = Math.abs(e.clientX - pointerDownRef.current.x);
    const dy = Math.abs(e.clientY - pointerDownRef.current.y);
    return dx < 6 && dy < 6;
  };

  const isPoweredOn = isLidOpen && isScreenOn;

  // Real chassis proportions: MacBook closes into a flush monolithic unibody slab
  const baseThickness = isThinkPad ? 0.11 : isMac ? 0.084 : 0.09;
  const chassisRadius = isThinkPad ? 0.014 : isMac ? 0.036 : isRog ? 0.024 : 0.022;
  const lidThickness = isMac ? 0.048 : 0.056;
  const lidRadius = isThinkPad ? 0.014 : isMac ? 0.024 : 0.02;
  const lidWidth = isMac ? 2.62 : 2.6;
  const lidDepth = isMac ? 1.75 : 1.72;
  const lidCenterY = isMac ? 0.028 : 0.032;
  const lidCenterZ = isMac ? 0.865 : 0.86;
  const hingeY = isMac ? 0.042 : 0.048;
  const hingeZ = isMac ? -0.865 : -0.84;

  const shellMap = colorway.weave ? carbonWeave : null;

  const screen = isMac
    ? { w: 2.44, h: 1.56, z: 0.855 }
    : { w: 2.32, h: 1.45, z: 0.84 };

  const hingeColor = isHp ? colorway.deckColor : '#242730';

  return (
    <group ref={laptopRootRef} scale={0.76}>
      <group position={[0, -0.22, 0]}>
        {/* ============================================================
            LOWER CHASSIS
           ============================================================ */}
        <RoundedBox
          args={[2.62, baseThickness, 1.76]}
          radius={chassisRadius}
          smoothness={4}
          castShadow
          receiveShadow
          onPointerDown={recordPointerDown}
          onClick={(e) => {
            e.stopPropagation();
            if (!isLidOpen && isCleanClick(e)) {
              onToggleLid();
            }
          }}
        >
          <meshStandardMaterial
            color={colorway.deckColor}
            map={shellMap}
            metalness={colorway.metalness}
            roughness={colorway.roughness}
          />
        </RoundedBox>

        {/* MacBook front thumb notch */}
        {isMac && (
          <mesh position={[0, baseThickness / 2 - 0.004, 0.87]}>
            <boxGeometry args={[0.4, 0.014, 0.03]} />
            <meshStandardMaterial color="#181a20" roughness={0.6} />
          </mesh>
        )}

        {/* Asus Zephyrus: Front & side light-blue LED bars + rear exhaust vents */}
        {isRog && (
          <>
            <mesh position={[0, -0.024, 0.881]}>
              <boxGeometry args={[1.95, 0.014, 0.012]} />
              <meshStandardMaterial
                color="#bae6fd"
                emissive="#7dd3fc"
                emissiveIntensity={isPoweredOn ? 1.4 : 0.35}
              />
            </mesh>
            {[-1.311, 1.311].map((sx) => (
              <mesh key={sx} position={[sx, -0.024, 0.45]}>
                <boxGeometry args={[0.01, 0.012, 0.55]} />
                <meshStandardMaterial
                  color="#bae6fd"
                  emissive="#7dd3fc"
                  emissiveIntensity={isPoweredOn ? 1.25 : 0.3}
                />
              </mesh>
            ))}
            <mesh position={[0, 0.004, -0.882]}>
              <boxGeometry args={[2.0, 0.03, 0.012]} />
              <meshStandardMaterial color="#14161c" roughness={0.75} />
            </mesh>
          </>
        )}

        {/* ThinkPad / OmniBook side ports hint */}
        {(isThinkPad || isHp) &&
          [-1.312, 1.312].map((px) => (
            <mesh key={px} position={[px, 0, -0.3]}>
              <boxGeometry args={[0.006, 0.026, 0.42]} />
              <meshStandardMaterial color="#14161c" roughness={0.75} />
            </mesh>
          ))}

        {/* Rubber feet */}
        {[
          [-1.08, -0.68],
          [1.08, -0.68],
          [-1.08, 0.68],
          [1.08, 0.68],
        ].map(([fx, fz]) => (
          <mesh key={`${fx}-${fz}`} position={[fx, -baseThickness / 2 - 0.004, fz]}>
            <cylinderGeometry args={[0.055, 0.055, 0.012, 16]} />
            <meshStandardMaterial color="#18181b" roughness={0.9} />
          </mesh>
        ))}

        <KeyboardDeck brand={brand} colorway={colorway} isKeyboardLit={isPoweredOn} />

        {/* Hinge: MacBook uses a recessed internal clutch (flush when closed); others use a rear barrel */}
        {isMac ? (
          <mesh position={[0, 0.022, -0.78]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 1.75, 16]} />
            <meshStandardMaterial color="#1f2229" roughness={0.5} metalness={0.5} />
          </mesh>
        ) : (
          <mesh position={[0, 0.044, -0.84]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.034, 0.034, isThinkPad ? 2.16 : 1.9, 20]} />
            <meshStandardMaterial
              color={hingeColor}
              metalness={isHp ? colorway.metalness : 0.45}
              roughness={isHp ? colorway.roughness : 0.42}
            />
          </mesh>
        )}

        {/* Screen bounce glow */}
        {isPoweredOn && (
          <pointLight
            position={[0, 0.65, 0.1]}
            intensity={1.65}
            distance={3.4}
            color={isRog ? '#38bdf8' : '#93c5fd'}
          />
        )}

        {/* ============================================================
            HINGE PIVOT & DISPLAY LID (0 rad = closed, -1.86 rad = open)
           ============================================================ */}
        <group ref={hingeRef} position={[0, hingeY, hingeZ]}>
          <RoundedBox
            args={[lidWidth, lidThickness, lidDepth]}
            radius={lidRadius}
            smoothness={4}
            position={[0, lidCenterY, lidCenterZ]}
            castShadow
            receiveShadow
            onPointerOver={(e) => {
              e.stopPropagation();
              setIsHovered(true);
            }}
            onPointerOut={() => setIsHovered(false)}
            onPointerDown={recordPointerDown}
            onClick={(e) => {
              e.stopPropagation();
              if (isCleanClick(e)) {
                onToggleLid();
              }
            }}
          >
            <meshStandardMaterial
              color={colorway.shellColor}
              map={shellMap}
              metalness={colorway.metalness}
              roughness={colorway.roughness}
            />
          </RoundedBox>

          {/* Brand emblem on the outer lid */}
          {isMac && <AppleLidLogo colorway={colorway} yOffset={0.0525} />}
          {isThinkPad && <ThinkPadLidBadges colorway={colorway} isPoweredOn={isPoweredOn} />}
          {isRog && <ZephyrusSlash colorway={colorway} isPoweredOn={isPoweredOn} />}
          {isHp && <HpOmniBookLidLogo colorway={colorway} />}

          {/* Inner screen bezel */}
          <mesh position={[0, -0.002, lidCenterZ]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.5, 1.64]} />
            <meshStandardMaterial color={brandConfig.bezelColor} roughness={0.38} />
          </mesh>

          {/* MacBook camera notch */}
          {isMac && (
            <mesh position={[0, -0.0095, 1.615]} rotation={[Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.22, 0.045]} />
              <meshStandardMaterial color="#050608" roughness={0.5} />
            </mesh>
          )}

          {/* Webcam */}
          <mesh
            position={[0, isMac ? -0.0105 : -0.007, isMac ? 1.618 : 1.635]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.014, 16]} />
            <meshStandardMaterial
              color={isPoweredOn ? '#34d399' : '#334155'}
              emissive={isPoweredOn ? '#10b981' : '#000000'}
              emissiveIntensity={0.8}
            />
          </mesh>

          {/* Active display panel */}
          <mesh
            position={[0, -0.008, screen.z]}
            rotation={[Math.PI / 2, 0, 0]}
            onPointerOver={(e) => {
              if (isPoweredOn) {
                e.stopPropagation();
                setIsHovered(true);
              }
            }}
            onPointerOut={() => setIsHovered(false)}
            onPointerDown={recordPointerDown}
            onClick={(e) => {
              e.stopPropagation();
              if (!isCleanClick(e)) return;
              if (!isLidOpen) {
                onToggleLid();
                return;
              }
              if (isScreenOn) {
                onScreenWallpaperClick();
              }
            }}
          >
            <planeGeometry args={[screen.w, screen.h]} />
            <meshStandardMaterial
              ref={screenMatRef}
              map={activeWallpaper}
              emissive="#ffffff"
              emissiveMap={activeWallpaper}
              metalness={0.08}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Laptop3D(props: Laptop3DProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.55, 5.4], fov: 34 }}
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
        <ResponsiveCameraRig />

        {/* Brighter studio lighting so dark laptop interiors & keycaps are clearly visible */}
        <ambientLight intensity={1.35} />
        <hemisphereLight args={['#ffffff', '#64748b', 0.9]} />

        <directionalLight
          position={[4, 7, 5]}
          intensity={2.4}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <directionalLight position={[-4, 5, -3]} intensity={1.35} color="#f1f5f9" />
        <directionalLight position={[0, 6, 3.5]} intensity={1.1} color="#ffffff" />

        <pointLight position={[0, 3.2, 2.5]} intensity={11} distance={12} color="#ffffff" />

        <LaptopModel {...props} />

        <ContactShadows
          position={[0, -0.34, 0]}
          opacity={0.34}
          scale={5.2}
          blur={2.2}
          far={2.6}
          color="#0f172a"
        />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          zoomSpeed={0.85}
          minDistance={2.6}
          maxDistance={11}
          enableDamping={true}
          dampingFactor={0.07}
          rotateSpeed={0.85}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.85}
        />
      </Canvas>
    </div>
  );
}
