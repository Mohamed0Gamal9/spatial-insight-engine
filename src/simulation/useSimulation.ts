import { useState, useCallback, useRef, useEffect } from 'react';
import { MissionPhase, PersonData, SimulationState } from './types';

const STANDING_KEYPOINTS: [number, number, number][] = [
  [0, 1.7, 0],      // nose
  [-0.05, 1.75, 0],  // left eye
  [0.05, 1.75, 0],   // right eye
  [-0.1, 1.7, 0],    // left ear
  [0.1, 1.7, 0],     // right ear
  [-0.2, 1.45, 0],   // left shoulder
  [0.2, 1.45, 0],    // right shoulder
  [-0.35, 1.1, 0],   // left elbow
  [0.35, 1.1, 0],    // right elbow
  [-0.4, 0.8, 0],    // left wrist
  [0.4, 0.8, 0],     // right wrist
  [-0.15, 0.9, 0],   // left hip
  [0.15, 0.9, 0],    // right hip
  [-0.15, 0.45, 0],  // left knee
  [0.15, 0.45, 0],   // right knee
  [-0.15, 0, 0],     // left ankle
  [0.15, 0, 0],      // right ankle
];

const SITTING_KEYPOINTS: [number, number, number][] = [
  [0, 1.2, 0],
  [-0.05, 1.25, 0],
  [0.05, 1.25, 0],
  [-0.1, 1.2, 0],
  [0.1, 1.2, 0],
  [-0.2, 1.0, 0],
  [0.2, 1.0, 0],
  [-0.35, 0.7, 0],
  [0.35, 0.7, 0],
  [-0.4, 0.5, 0.1],
  [0.4, 0.5, 0.1],
  [-0.15, 0.55, 0.1],
  [0.15, 0.55, 0.1],
  [-0.15, 0.45, 0.3],
  [0.15, 0.45, 0.3],
  [-0.15, 0.0, 0.3],
  [0.15, 0.0, 0.3],
];

const WALKING_KEYPOINTS: [number, number, number][] = [
  [0, 1.65, 0],
  [-0.05, 1.7, 0],
  [0.05, 1.7, 0],
  [-0.1, 1.65, 0],
  [0.1, 1.65, 0],
  [-0.2, 1.4, 0],
  [0.2, 1.4, 0],
  [-0.3, 1.05, -0.1],
  [0.3, 1.05, 0.1],
  [-0.25, 0.8, -0.15],
  [0.25, 0.8, 0.15],
  [-0.15, 0.85, 0],
  [0.15, 0.85, 0],
  [-0.2, 0.4, 0.15],
  [0.2, 0.4, -0.1],
  [-0.2, 0, 0.25],
  [0.2, 0, -0.15],
];

function getKeypoints(activity: string): [number, number, number][] {
  switch (activity) {
    case 'Sitting': return SITTING_KEYPOINTS;
    case 'Walking': return WALKING_KEYPOINTS;
    default: return STANDING_KEYPOINTS;
  }
}

const BASE_PERSONS: Omit<PersonData, 'visible' | 'keypoints'>[] = [
  { id: 1, name: 'Person Alpha', position: [-2, 0, -1], activity: 'Standing', heartRate: 72, breathRate: 16, confidence: 92, room: 1 },
  { id: 2, name: 'Person Bravo', position: [0, 0, 1], activity: 'Sitting', heartRate: 68, breathRate: 14, confidence: 87, room: 2 },
  { id: 3, name: 'Person Charlie', position: [2.5, 0, -0.5], activity: 'Walking', heartRate: 85, breathRate: 20, confidence: 79, room: 3 },
  { id: 4, name: 'Person Delta', position: [-1, 0, 2], activity: 'Standing', heartRate: 75, breathRate: 17, confidence: 84, room: 1 },
];

const PHASE_DURATIONS: Record<MissionPhase, number> = {
  idle: Infinity,
  launch: 3,
  mapping: 15,
  sensing: 20,
  complete: Infinity,
};

export function useSimulation() {
  const [state, setState] = useState<SimulationState>({
    phase: 'idle',
    elapsed: 0,
    persons: BASE_PERSONS.map(p => ({ ...p, visible: false, keypoints: getKeypoints(p.activity) })),
    drone: { position: [0, 0, 0], battery: 100, altitude: 0, mode: 'Standby' },
    mappingProgress: 0,
    systemStatus: { wifiCSI: true, uwb: false, mmWave: false, lidar: true, irSlam: true },
  });

  const phaseStartRef = useRef(0);
  const rafRef = useRef<number>(0);
  const phaseRef = useRef<MissionPhase>('idle');

  const tick = useCallback(() => {
    const now = performance.now() / 1000;
    const phaseElapsed = now - phaseStartRef.current;
    const phase = phaseRef.current;

    setState(prev => {
      const t = phaseElapsed;
      let newPhase = phase;
      let nextPhaseStart = false;

      if (phase !== 'idle' && phase !== 'complete' && t >= PHASE_DURATIONS[phase]) {
        const phases: MissionPhase[] = ['idle', 'launch', 'mapping', 'sensing', 'complete'];
        const idx = phases.indexOf(phase);
        newPhase = phases[idx + 1] || 'complete';
        nextPhaseStart = true;
      }

      if (nextPhaseStart) {
        phaseRef.current = newPhase;
        phaseStartRef.current = now;
      }

      const droneAngle = now * (phase === 'mapping' ? 0.5 : 0.15);
      const droneRadius = phase === 'mapping' ? 4 : 2.5;
      const droneAlt = phase === 'launch' ? Math.min(t * 1.5, 3) :
        phase === 'idle' ? 0 : 3 + Math.sin(now * 0.5) * 0.3;

      const dronePos: [number, number, number] = phase === 'idle'
        ? [0, 0, 0]
        : [Math.cos(droneAngle) * droneRadius, droneAlt, Math.sin(droneAngle) * droneRadius];

      const battery = Math.max(100 - (now - phaseStartRef.current) * 0.3, 20);

      const mappingProgress = phase === 'mapping' ? Math.min(t / PHASE_DURATIONS.mapping, 1)
        : phase === 'sensing' || phase === 'complete' ? 1 : prev.mappingProgress;

      const persons = prev.persons.map((p, i) => {
        const visible = (phase === 'sensing' && t > (i + 1) * 4) || phase === 'complete';
        const hrVar = Math.sin(now * 0.7 + i * 2) * 3;
        const brVar = Math.sin(now * 0.4 + i * 3) * 1.5;
        return {
          ...p,
          visible,
          heartRate: Math.round(BASE_PERSONS[i].heartRate + hrVar),
          breathRate: Math.round(BASE_PERSONS[i].breathRate + brVar),
          confidence: Math.min(99, Math.round(BASE_PERSONS[i].confidence + Math.sin(now + i) * 3)),
        };
      });

      const modeMap: Record<MissionPhase, string> = {
        idle: 'Standby', launch: 'Launching', mapping: 'SLAM Mapping',
        sensing: 'WiFi CSI Sensing', complete: 'Mission Complete',
      };

      return {
        ...prev,
        phase: newPhase,
        elapsed: t,
        drone: { position: dronePos, battery: Math.round(battery), altitude: Number(droneAlt.toFixed(1)), mode: modeMap[newPhase] },
        persons,
        mappingProgress,
      };
    });

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startMission = useCallback(() => {
    phaseRef.current = 'launch';
    phaseStartRef.current = performance.now() / 1000;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const resetMission = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    phaseRef.current = 'idle';
    setState(prev => ({
      ...prev,
      phase: 'idle',
      elapsed: 0,
      persons: BASE_PERSONS.map(p => ({ ...p, visible: false, keypoints: getKeypoints(p.activity) })),
      drone: { position: [0, 0, 0], battery: 100, altitude: 0, mode: 'Standby' },
      mappingProgress: 0,
    }));
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { state, startMission, resetMission };
}
