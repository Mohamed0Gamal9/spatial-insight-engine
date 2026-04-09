import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { Building } from './Building';
import { Drone } from './Drone';
import { PersonSkeleton } from './PersonSkeleton';
import { SimulationState } from '@/simulation/types';

interface Scene3DProps {
  state: SimulationState;
}

const PERSON_COLORS = ['#00e68a', '#00ccff', '#ffaa00', '#ff6666'];

export function Scene3D({ state }: Scene3DProps) {
  const isActive = state.phase !== 'idle';

  return (
    <Canvas
      camera={{ position: [8, 8, 8], fov: 50 }}
      style={{ background: '#050d14' }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 10, 5]} intensity={0.3} color="#4488aa" />

      <Stars radius={50} depth={50} count={1000} factor={2} saturation={0} fade speed={0.5} />

      <Building opacity={Math.max(state.mappingProgress, 0.15)} />

      <Drone position={state.drone.position} isActive={isActive} />

      {state.persons.map((person, i) => (
        <PersonSkeleton
          key={person.id}
          position={person.position}
          keypoints={person.keypoints}
          visible={person.visible}
          color={PERSON_COLORS[i % PERSON_COLORS.length]}
        />
      ))}

      {/* Room labels */}
      {state.mappingProgress > 0.3 && (
        <>
          <Text position={[-3.2, 0.1, -2]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#00e68a" anchorX="center" font={undefined}>
            ROOM A
          </Text>
          <Text position={[0.2, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#00e68a" anchorX="center" font={undefined}>
            ROOM B
          </Text>
          <Text position={[3.5, 0.1, -1]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.3} color="#00e68a" anchorX="center" font={undefined}>
            ROOM C
          </Text>
        </>
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={25}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
