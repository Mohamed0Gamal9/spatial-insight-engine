import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DroneProps {
  position: [number, number, number];
  isActive: boolean;
}

export function Drone({ position, isActive }: DroneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const propRefs = useRef<THREE.Mesh[]>([]);
  const signalRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!isActive) return;
    // Spin propellers
    propRefs.current.forEach((prop) => {
      if (prop) prop.rotation.y += delta * 30;
    });
    // Pulse signal ring
    if (signalRef.current) {
      const scale = signalRef.current.scale.x;
      if (scale > 5) {
        signalRef.current.scale.set(0.5, 0.5, 0.5);
        (signalRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5;
      } else {
        signalRef.current.scale.multiplyScalar(1 + delta * 1.5);
        (signalRef.current.material as THREE.MeshBasicMaterial).opacity *= (1 - delta * 0.8);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#2a4a5a" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Arms + Propellers */}
      {[[-0.3, 0, -0.3], [0.3, 0, -0.3], [-0.3, 0, 0.3], [0.3, 0, 0.3]].map((armPos, i) => (
        <group key={i} position={armPos as [number, number, number]}>
          {/* Arm */}
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
            <meshStandardMaterial color="#3a6a7a" />
          </mesh>
          {/* Propeller */}
          <mesh
            ref={(el) => { if (el) propRefs.current[i] = el; }}
            position={[0, 0.08, 0]}
          >
            <boxGeometry args={[0.25, 0.01, 0.04]} />
            <meshStandardMaterial color="#00e68a" emissive="#00e68a" emissiveIntensity={0.5} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}

      {/* LED indicator */}
      <pointLight color="#00e68a" intensity={2} distance={3} />
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#00e68a" />
      </mesh>

      {/* WiFi signal ring */}
      {isActive && (
        <mesh ref={signalRef} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial color="#00ccff" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
