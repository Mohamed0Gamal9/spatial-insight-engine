import { useState, useCallback, useRef, useEffect } from 'react';
import { MissionPhase, PersonData, SimulationState } from './types';

const STANDING_KEYPOINTS: [number, number, number][] = [
  [0, 1.7, 0], [-0.05, 1.75, 0], [0.05, 1.75, 0], [-0.1, 1.7, 0], [0.1, 1.7, 0],
  [-0.2, 1.45, 0], [0.2, 1.45, 0], [-0.35, 1.1, 0], [0.35, 1.1, 0],
  [-0.4, 0.8, 0], [0.4, 0.8, 0], [-0.15, 0.9, 0], [0.15, 0.9, 0],
  [-0.15, 0.45, 0], [0.15, 0.45, 0], [-0.15, 0, 0], [0.15, 0, 0],
];

const SITTING_KEYPOINTS: [number, number, number][] = [
  [0, 1.2, 0], [-0.05, 1.25, 0], [0.05, 1.25, 0], [-0.1, 1.2, 0], [0.1, 1.2, 0],
  [-0.2, 1.0, 0], [0.2, 1.0, 0], [-0.35, 0.7, 0], [0.35, 0.7, 0],
  [-0.4, 0.5, 0.1], [0.4, 0.5, 0.1], [-0.15, 0.55, 0.1], [0.15, 0.55, 0.1],
  [-0.15, 0.45, 0.3], [0.15, 0.45, 0.3], [-0.15, 0.0, 0.3], [0.15, 0.0, 0.3],
];

const WALKING_KEYPOINTS: [number, number, number][] = [
  [0, 1.65, 0], [-0.05, 1.7, 0], [0.05, 1.7, 0], [-0.1, 1.65, 0], [0.1, 1.65, 0],
  [-0.2, 1.4, 0], [0.2, 1.4, 0], [-0.3, 1.05, -0.1], [0.3, 1.05, 0.1],
  [-0.25, 0.8, -0.15], [0.25, 0.8, 0.15], [-0.15, 0.85, 0], [0.15, 0.85, 0],
  [-0.2, 0.4, 0.15], [0.2, 0.4, -0.1], [-0.2, 0, 0.25], [0.2, 0, -0.15],
];

function getKeypoints(activity: string): [number, number, number][] {
  switch (activity) {
    case 'Sitting': return SITTING_KEYPOINTS;
    case 'Walking': return WALKING_KEYPOINTS;
    default: return STANDING_KEYPOINTS;
  }
}

// Persons: Alpha & Delta in Room A (1), Bravo in Room B (2), Charlie in Room C (3)
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

// Room center positions for drone hover during sensing
const ROOM_CENTERS: [number, number, number][] = [
  [-3, 3, -1],   // Room A
  [0.2, 3, 0],   // Room B
  [3.5, 3, -0.5], // Room C
];

// Room scan schedule: [startTime, endTime, roomIndex(0-based)]
const ROOM_SCHEDULE: [number, number, number][] = [
  [0, 6.5, 0],      // Room A: 0–6.5s
  [6.5, 13, 1],      // Room B: 6.5–13s
  [13, 20, 2],       // Room C: 13–20s
];

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function lerpVec3(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  const e = easeInOut(Math.max(0, Math.min(1, t)));
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>({
    phase: 'idle',
    elapsed: 0,
    persons: BASE_PERSONS.map(p => ({ ...p, visible: false, keypoints: getKeypoints(p.activity) })),
    drone: { position: [0, 0, 0], battery: 100, altitude: 0, mode: 'Standby', currentRoom: 0 },
    mappingProgress: 0,
    scanProgress: 0,
    detectedCount: 0,
    systemStatus: { wifiCSI: true, lidar: true, irSlam: true, orbSlam3: true },
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

      // Drone position
      let dronePos: [number, number, number];
      let currentRoom = 0;

      if (newPhase === 'idle') {
        dronePos = [0, 0, 0];
      } else if (newPhase === 'launch') {
        dronePos = [0, Math.min(t * 1.5, 3), 0];
      } else if (newPhase === 'mapping') {
        const angle = now * 0.5;
        const r = 4;
        dronePos = [Math.cos(angle) * r, 3 + Math.sin(now * 0.5) * 0.3, Math.sin(angle) * r];
      } else if (newPhase === 'sensing') {
        const st = nextPhaseStart ? 0 : t;
        // Find current and previous room
        let schedIdx = ROOM_SCHEDULE.findIndex(([s, e]) => st >= s && st < e);
        if (schedIdx === -1) schedIdx = ROOM_SCHEDULE.length - 1;
        currentRoom = schedIdx + 1;

        if (schedIdx === 0) {
          // Transition from mapping orbit to Room A
          const transT = Math.min(st / 1.5, 1);
          const mappingEnd: [number, number, number] = [Math.cos(now * 0.5) * 4, 3, Math.sin(now * 0.5) * 4];
          dronePos = lerpVec3(mappingEnd, ROOM_CENTERS[0], transT);
        } else {
          // Transition between rooms
          const [prevStart, prevEnd] = ROOM_SCHEDULE[schedIdx - 1];
          const [curStart] = ROOM_SCHEDULE[schedIdx];
          const transitionDuration = 1.5;
          const timeSinceSwitch = st - curStart;
          if (timeSinceSwitch < transitionDuration) {
            dronePos = lerpVec3(ROOM_CENTERS[schedIdx - 1], ROOM_CENTERS[schedIdx], timeSinceSwitch / transitionDuration);
          } else {
            // Hover with slight bob
            const c = ROOM_CENTERS[schedIdx];
            dronePos = [c[0], c[1] + Math.sin(now * 0.8) * 0.15, c[2]];
          }
        }
      } else {
        // Complete — hover center
        dronePos = [0, 3 + Math.sin(now * 0.5) * 0.2, 0];
        currentRoom = 0;
      }

      const battery = Math.max(100 - (now - phaseStartRef.current) * 0.3, 20);

      const mappingProgress = newPhase === 'mapping' ? Math.min(t / PHASE_DURATIONS.mapping, 1)
        : newPhase === 'sensing' || newPhase === 'complete' ? 1 : prev.mappingProgress;

      const scanProgress = newPhase === 'sensing' ? Math.min(t / PHASE_DURATIONS.sensing, 1)
        : newPhase === 'complete' ? 1 : 0;

      // Persons reveal room by room during sensing
      const persons = prev.persons.map((p, i) => {
        let visible = false;
        if (newPhase === 'complete') {
          visible = true;
        } else if (newPhase === 'sensing') {
          const st = nextPhaseStart ? 0 : t;
          // Room A persons visible after drone arrives at Room A (~2s in)
          if (p.room === 1 && st > 2) visible = true;
          // Room B persons visible after drone arrives at Room B (~8s in)
          if (p.room === 2 && st > 8) visible = true;
          // Room C persons visible after drone arrives at Room C (~14.5s in)
          if (p.room === 3 && st > 14.5) visible = true;
        }

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

      const detectedCount = persons.filter(p => p.visible).length;

      const modeMap: Record<MissionPhase, string> = {
        idle: 'Standby', launch: 'Launching', mapping: 'SLAM Mapping',
        sensing: 'WiFi CSI Sensing', complete: 'Mission Complete',
      };

      return {
        ...prev,
        phase: newPhase,
        elapsed: t,
        drone: {
          position: dronePos,
          battery: Math.round(battery),
          altitude: Number(dronePos[1].toFixed(1)),
          mode: modeMap[newPhase],
          currentRoom,
        },
        persons,
        mappingProgress,
        scanProgress,
        detectedCount,
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
      drone: { position: [0, 0, 0], battery: 100, altitude: 0, mode: 'Standby', currentRoom: 0 },
      mappingProgress: 0,
      scanProgress: 0,
      detectedCount: 0,
    }));
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return { state, startMission, resetMission };
}
