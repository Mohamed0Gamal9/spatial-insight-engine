import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CSIHeatmapProps {
  active: boolean;
  dronePosition: [number, number, number];
  persons: { position: [number, number, number]; visible: boolean }[];
}

const GRID_SIZE = 40;
const FLOOR_WIDTH = 10;
const FLOOR_DEPTH = 8;

export function CSIHeatmap({ active, dronePosition, persons }: CSIHeatmapProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.DataTexture | null>(null);

  const { texture, data } = useMemo(() => {
    const d = new Uint8Array(GRID_SIZE * GRID_SIZE * 4);
    const tex = new THREE.DataTexture(d, GRID_SIZE, GRID_SIZE);
    tex.needsUpdate = true;
    return { texture: tex, data: d };
  }, []);

  useFrame((state) => {
    if (!active || !textureRef.current) return;
    const t = state.clock.elapsedTime;

    for (let gy = 0; gy < GRID_SIZE; gy++) {
      for (let gx = 0; gx < GRID_SIZE; gx++) {
        // Map grid to world coords
        const wx = (gx / GRID_SIZE) * FLOOR_WIDTH - FLOOR_WIDTH / 2;
        const wz = (gy / GRID_SIZE) * FLOOR_DEPTH - FLOOR_DEPTH / 2;

        // Distance from drone (projected to floor)
        const ddx = wx - dronePosition[0];
        const ddz = wz - dronePosition[2];
        const droneDist = Math.sqrt(ddx * ddx + ddz * ddz);

        // Base signal: stronger near drone, with wave ripple
        const wave = Math.sin(droneDist * 2 - t * 3) * 0.5 + 0.5;
        let signal = Math.max(0, 1 - droneDist / 6) * 0.3 * wave;

        // Boost near detected persons (CSI reflection hotspots)
        for (const p of persons) {
          if (!p.visible) continue;
          const pdx = wx - p.position[0];
          const pdz = wz - p.position[2];
          const pDist = Math.sqrt(pdx * pdx + pdz * pdz);
          const hotspot = Math.exp(-pDist * pDist / 0.8) * 0.9;
          signal += hotspot;
        }

        signal = Math.min(signal, 1);

        const idx = (gy * GRID_SIZE + gx) * 4;

        // Color: blue (weak) → cyan (medium) → green (strong) → yellow (very strong)
        if (signal < 0.25) {
          // Dark blue to blue
          data[idx] = 0;
          data[idx + 1] = Math.floor(signal * 4 * 100);
          data[idx + 2] = Math.floor(signal * 4 * 255);
        } else if (signal < 0.5) {
          // Blue to cyan
          const s = (signal - 0.25) * 4;
          data[idx] = 0;
          data[idx + 1] = Math.floor(100 + s * 155);
          data[idx + 2] = 255;
        } else if (signal < 0.75) {
          // Cyan to green
          const s = (signal - 0.5) * 4;
          data[idx] = 0;
          data[idx + 1] = 255;
          data[idx + 2] = Math.floor(255 * (1 - s));
        } else {
          // Green to yellow
          const s = (signal - 0.75) * 4;
          data[idx] = Math.floor(s * 255);
          data[idx + 1] = 255;
          data[idx + 2] = 0;
        }
        data[idx + 3] = Math.floor(signal * 180); // Alpha
      }
    }

    textureRef.current.needsUpdate = true;
  });

  textureRef.current = texture;

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[FLOOR_WIDTH, FLOOR_DEPTH]} />
      <meshBasicMaterial map={texture} transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}
