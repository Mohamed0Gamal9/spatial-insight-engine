import { useRef } from 'react';
import * as THREE from 'three';

interface BuildingProps {
  opacity: number;
}

function Wall({ position, size, opacity }: { position: [number, number, number]; size: [number, number, number]; opacity: number }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#1a3a4a"
        transparent
        opacity={opacity * 0.3}
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}

function WallFrame({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color="#00e68a" wireframe transparent opacity={0.6} />
    </mesh>
  );
}

export function Building({ opacity }: BuildingProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef}>
      {/* Floor */}
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#0a1a25" transparent opacity={opacity * 0.8} />
      </mesh>

      {/* Floor grid */}
      <gridHelper args={[10, 20, '#00e68a', '#0a2a35']} position={[0, 0.01, 0]} />

      {/* Outer walls */}
      <Wall position={[-5, 1.5, 0]} size={[0.1, 3, 8]} opacity={opacity} />
      <Wall position={[5, 1.5, 0]} size={[0.1, 3, 8]} opacity={opacity} />
      <Wall position={[0, 1.5, -4]} size={[10, 3, 0.1]} opacity={opacity} />
      <Wall position={[0, 1.5, 4]} size={[10, 3, 0.1]} opacity={opacity} />

      {/* Interior walls - creating 3 rooms */}
      <Wall position={[-1.5, 1.5, -1]} size={[0.08, 3, 6]} opacity={opacity} />
      <Wall position={[2, 1.5, 1]} size={[0.08, 3, 6]} opacity={opacity} />

      {/* Wireframe overlay */}
      <WallFrame position={[-5, 1.5, 0]} size={[0.1, 3, 8]} />
      <WallFrame position={[5, 1.5, 0]} size={[0.1, 3, 8]} />
      <WallFrame position={[0, 1.5, -4]} size={[10, 3, 0.1]} />
      <WallFrame position={[0, 1.5, 4]} size={[10, 3, 0.1]} />
      <WallFrame position={[-1.5, 1.5, -1]} size={[0.08, 3, 6]} />
      <WallFrame position={[2, 1.5, 1]} size={[0.08, 3, 6]} />

      {/* Room labels */}
      {/* Ceiling edges for visibility */}
      <mesh position={[0, 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#0a1a25" transparent opacity={opacity * 0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
