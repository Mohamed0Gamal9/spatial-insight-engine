import { useMemo } from 'react';
import * as THREE from 'three';
import { KEYPOINT_CONNECTIONS } from '@/simulation/types';

interface PersonSkeletonProps {
  position: [number, number, number];
  keypoints: [number, number, number][];
  visible: boolean;
  color?: string;
}

export function PersonSkeleton({ position, keypoints, visible, color = '#00e68a' }: PersonSkeletonProps) {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    KEYPOINT_CONNECTIONS.forEach(([a, b]) => {
      if (keypoints[a] && keypoints[b]) {
        points.push(new THREE.Vector3(...keypoints[a]));
        points.push(new THREE.Vector3(...keypoints[b]));
      }
    });
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [keypoints]);

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Skeleton lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={color} linewidth={2} transparent opacity={0.9} />
      </lineSegments>

      {/* Keypoint dots */}
      {keypoints.map((kp, i) => (
        <mesh key={i} position={kp}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color={i === 0 ? '#00ccff' : color} />
        </mesh>
      ))}

      {/* Head glow */}
      <pointLight position={keypoints[0]} color="#00ccff" intensity={0.5} distance={1} />
    </group>
  );
}
