import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BuildingProps {
  opacity: number;
  mappingProgress: number;
}

function Wall({ position, size, opacity }: { position: [number, number, number]; size: [number, number, number]; opacity: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#1a3a4a" transparent opacity={opacity * 0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

function WallFrame({ position, size, opacity }: { position: [number, number, number]; size: [number, number, number]; opacity: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color="#00e68a" wireframe transparent opacity={opacity * 0.6} />
    </mesh>
  );
}

function ScanPlane({ mappingProgress }: { mappingProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!meshRef.current || mappingProgress >= 1) return;
    meshRef.current.position.z = -4 + mappingProgress * 8;
  });

  if (mappingProgress <= 0 || mappingProgress >= 1) return null;

  return (
    <mesh ref={meshRef} position={[0, 1.5, 0]} rotation={[0, 0, 0]}>
      <planeGeometry args={[10, 3]} />
      <meshBasicMaterial color="#00ccff" transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Building({ opacity, mappingProgress }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Outer walls appear first, interior walls after 30%
  const outerOpacity = Math.min(opacity, mappingProgress * 3);
  const interiorOpacity = Math.max(0, (mappingProgress - 0.3) / 0.7) * opacity;

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#0a1a25" transparent opacity={outerOpacity * 0.8} />
      </mesh>

      {/* Floor grid */}
      <gridHelper args={[10, 20, '#00e68a', '#0a2a35']} position={[0, 0.01, 0]} />

      {/* Outer walls */}
      <Wall position={[-5, 1.5, 0]} size={[0.1, 3, 8]} opacity={outerOpacity} />
      <Wall position={[5, 1.5, 0]} size={[0.1, 3, 8]} opacity={outerOpacity} />
      <Wall position={[0, 1.5, -4]} size={[10, 3, 0.1]} opacity={outerOpacity} />
      <Wall position={[0, 1.5, 4]} size={[10, 3, 0.1]} opacity={outerOpacity} />

      {/* Interior walls — fade in after 30% mapping */}
      <Wall position={[-1.5, 1.5, -1]} size={[0.08, 3, 6]} opacity={interiorOpacity} />
      <Wall position={[2, 1.5, 1]} size={[0.08, 3, 6]} opacity={interiorOpacity} />

      {/* Wireframe overlays */}
      <WallFrame position={[-5, 1.5, 0]} size={[0.1, 3, 8]} opacity={outerOpacity} />
      <WallFrame position={[5, 1.5, 0]} size={[0.1, 3, 8]} opacity={outerOpacity} />
      <WallFrame position={[0, 1.5, -4]} size={[10, 3, 0.1]} opacity={outerOpacity} />
      <WallFrame position={[0, 1.5, 4]} size={[10, 3, 0.1]} opacity={outerOpacity} />
      <WallFrame position={[-1.5, 1.5, -1]} size={[0.08, 3, 6]} opacity={interiorOpacity} />
      <WallFrame position={[2, 1.5, 1]} size={[0.08, 3, 6]} opacity={interiorOpacity} />

      {/* Scan plane during mapping */}
      <ScanPlane mappingProgress={mappingProgress} />

      {/* Ceiling */}
      <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#0a1a25" transparent opacity={outerOpacity * 0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
