import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface LidarBeamProps {
  dronePosition: [number, number, number];
  active: boolean;
}

export function LidarBeam({ dronePosition, active }: LidarBeamProps) {
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !active) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 3;
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={dronePosition}>
      {/* Rotating LiDAR cone beam */}
      <mesh ref={beamRef} position={[0, -1.5, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[1.8, 3, 4, 1, true]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
      {/* Thin laser line */}
      <mesh position={[0.8, -1.5, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 3, 4]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.6} />
      </mesh>
      {/* Second laser 90° offset */}
      <mesh position={[0, -1.5, 0.8]}>
        <cylinderGeometry args={[0.005, 0.005, 3, 4]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
