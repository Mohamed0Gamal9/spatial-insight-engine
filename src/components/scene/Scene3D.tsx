import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { Building } from './Building';
import { Drone } from './Drone';
import { PersonSkeleton } from './PersonSkeleton';
import { LidarBeam } from './LidarBeam';
import { VitalWaveform } from './VitalWaveform';
import { SimulationState } from '@/simulation/types';

interface Scene3DProps {
  state: SimulationState;
}

const PERSON_COLORS = ['#00e68a', '#00ccff', '#ffaa00', '#ff6666'];

// Room highlight box positions & sizes
const ROOM_BOXES: { pos: [number, number, number]; size: [number, number, number] }[] = [
  { pos: [-3.25, 1.5, -1], size: [3.4, 3, 6] },   // Room A
  { pos: [0.25, 1.5, 0], size: [3.4, 3, 8] },      // Room B
  { pos: [3.5, 1.5, -0.5], size: [2.9, 3, 6] },    // Room C
];

export function Scene3D({ state }: Scene3DProps) {
  const isActive = state.phase !== 'idle';
  const isSensing = state.phase === 'sensing';
  const isMapping = state.phase === 'mapping';
  const activeRoomIdx = state.drone.currentRoom - 1;

  return (
    <Canvas camera={{ position: [8, 8, 8], fov: 50 }} style={{ background: '#050d14' }}>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 10, 5]} intensity={0.3} color="#4488aa" />
      <Stars radius={50} depth={50} count={1000} factor={2} saturation={0} fade speed={0.5} />

      <Building opacity={Math.max(state.mappingProgress, 0.15)} mappingProgress={state.mappingProgress} />
      <Drone position={state.drone.position} isActive={isActive} isSensing={isSensing} />

      {/* LiDAR beam during mapping */}
      <LidarBeam dronePosition={state.drone.position} active={isMapping} />

      {state.persons.map((person, i) => (
        <group key={person.id}>
          <PersonSkeleton
            position={person.position}
            keypoints={person.keypoints}
            visible={person.visible}
            color={PERSON_COLORS[i % PERSON_COLORS.length]}
          />
          <VitalWaveform
            position={person.position}
            heartRate={person.heartRate}
            breathRate={person.breathRate}
            visible={person.visible}
            color={PERSON_COLORS[i % PERSON_COLORS.length]}
          />
        </group>
      ))}

      {/* Room highlight box during sensing */}
      {isSensing && activeRoomIdx >= 0 && activeRoomIdx < ROOM_BOXES.length && (
        <mesh position={ROOM_BOXES[activeRoomIdx].pos}>
          <boxGeometry args={ROOM_BOXES[activeRoomIdx].size} />
          <meshBasicMaterial color="#00ccff" transparent opacity={0.04} side={2} />
        </mesh>
      )}

      {/* Room labels */}
      {state.mappingProgress > 0.3 && (
        <>
          {state.mappingProgress > 0.35 && (
            <Text position={[-3.2, 0.1, -2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#00e68a" anchorX="center" font={undefined}>
              ROOM A
            </Text>
          )}
          {state.mappingProgress > 0.55 && (
            <Text position={[0.2, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#00e68a" anchorX="center" font={undefined}>
              ROOM B
            </Text>
          )}
          {state.mappingProgress > 0.75 && (
            <Text position={[3.5, 0.1, -1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#00e68a" anchorX="center" font={undefined}>
              ROOM C
            </Text>
          )}
        </>
      )}

      <OrbitControls enableDamping dampingFactor={0.05} minDistance={3} maxDistance={25} maxPolarAngle={Math.PI / 2.1} />
    </Canvas>
  );
}
