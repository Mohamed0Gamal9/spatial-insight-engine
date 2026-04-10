import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DroneProps {
  position: [number, number, number];
  isActive: boolean;
  isSensing: boolean;
}

export function Drone({ position, isActive, isSensing }: DroneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<THREE.Mesh[]>([]);
  const ringRefs = useRef<THREE.Mesh[]>([]);

  useFrame((_, delta) => {
    if (!isActive) return;
    propRefs.current.forEach((prop) => {
      if (prop) prop.rotation.y += delta * 30;
    });
    // 3 expanding WiFi rings with staggered phases
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const maxScale = isSensing ? 8 : 5;
      const speed = isSensing ? 2.5 : 1.5;
      const scale = ring.scale.x;
      if (scale > maxScale) {
        ring.scale.set(0.5, 0.5, 0.5);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.5;
      } else {
        ring.scale.multiplyScalar(1 + delta * speed);
        (ring.material as THREE.MeshBasicMaterial).opacity *= (1 - delta * 0.8);
      }
    });
  });

  const ringColor = isSensing ? '#00ccff' : '#00e68a';

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#2a4a5a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Arms + Propellers */}
      {([[-0.3, 0, -0.3], [0.3, 0, -0.3], [-0.3, 0, 0.3], [0.3, 0, 0.3]] as [number, number, number][]).map((armPos, i) => (
        <group key={i} position={armPos}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
            <meshStandardMaterial color="#3a6a7a" />
          </mesh>
          <mesh ref={(el) => { if (el) propRefs.current[i] = el; }} position={[0, 0.08, 0]}>
            <boxGeometry args={[0.25, 0.01, 0.04]} />
            <meshStandardMaterial color="#00e68a" emissive="#00e68a" emissiveIntensity={0.5} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      {/* LED */}
      <pointLight color="#00e68a" intensity={2} distance={3} />
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#00e68a" />
      </mesh>

      {/* 3 WiFi signal rings */}
      {isActive && [0, 1, 2].map(i => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringRefs.current[i] = el; }}
          position={[0, -0.2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1 + i * 1.5, 1 + i * 1.5, 1 + i * 1.5]}
        >
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color={ringColor} transparent opacity={0.3 - i * 0.08} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
