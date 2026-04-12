import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface VitalWaveformProps {
  position: [number, number, number];
  heartRate: number;
  breathRate: number;
  visible: boolean;
  color: string;
}

const WAVE_POINTS = 40;

export function VitalWaveform({ position, heartRate, breathRate, visible, color }: VitalWaveformProps) {
  const hrRef = useRef<THREE.Line>(null);
  const brRef = useRef<THREE.Line>(null);
  const hrGeoRef = useRef<THREE.BufferGeometry>(null);
  const brGeoRef = useRef<THREE.BufferGeometry>(null);

  useFrame((state) => {
    if (!visible) return;
    const t = state.clock.elapsedTime;
    const hrFreq = heartRate / 60;
    const brFreq = breathRate / 60;

    // Update HR waveform
    if (hrGeoRef.current) {
      const pos = hrGeoRef.current.attributes.position;
      for (let i = 0; i < WAVE_POINTS; i++) {
        const x = (i / WAVE_POINTS) * 0.8 - 0.4;
        const phase = t * hrFreq * Math.PI * 2 - i * 0.3;
        // Sharp ECG-like spike
        const spike = Math.exp(-Math.pow((Math.sin(phase) - 0.8) * 3, 2)) * 0.08;
        const y = spike + Math.sin(phase) * 0.015;
        (pos as THREE.BufferAttribute).setXY(i, x, y);
      }
      hrGeoRef.current.attributes.position.needsUpdate = true;
    }

    // Update BR waveform
    if (brGeoRef.current) {
      const pos = brGeoRef.current.attributes.position;
      for (let i = 0; i < WAVE_POINTS; i++) {
        const x = (i / WAVE_POINTS) * 0.8 - 0.4;
        const phase = t * brFreq * Math.PI * 2 - i * 0.25;
        const y = Math.sin(phase) * 0.04;
        (pos as THREE.BufferAttribute).setXY(i, x, y);
      }
      brGeoRef.current.attributes.position.needsUpdate = true;
    }
  });

  const initialPositions = useMemo(() => new Float32Array(WAVE_POINTS * 3), []);

  if (!visible) return null;

  return (
    <group position={[position[0], position[1] + 2.1, position[2]]}>
      {/* HR label + waveform */}
      <group position={[0, 0.12, 0]}>
        <line ref={hrRef as any}>
          <bufferGeometry ref={hrGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              count={WAVE_POINTS}
              array={initialPositions.slice()}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#ff4444" transparent opacity={0.8} />
        </line>
      </group>

      {/* BR waveform below */}
      <group position={[0, 0, 0]}>
        <line ref={brRef as any}>
          <bufferGeometry ref={brGeoRef}>
            <bufferAttribute
              attach="attributes-position"
              count={WAVE_POINTS}
              array={initialPositions.slice()}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#00ccff" transparent opacity={0.8} />
        </line>
      </group>
    </group>
  );
}
