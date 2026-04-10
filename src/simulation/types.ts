export type MissionPhase = 'idle' | 'launch' | 'mapping' | 'sensing' | 'complete';

export interface PersonData {
  id: number;
  name: string;
  position: [number, number, number];
  activity: 'Standing' | 'Sitting' | 'Walking';
  heartRate: number;
  breathRate: number;
  confidence: number;
  room: number;
  visible: boolean;
  keypoints: [number, number, number][];
}

export interface DroneState {
  position: [number, number, number];
  battery: number;
  altitude: number;
  mode: string;
  currentRoom: number; // 1=A, 2=B, 3=C, 0=none
}

export interface SimulationState {
  phase: MissionPhase;
  elapsed: number;
  persons: PersonData[];
  drone: DroneState;
  mappingProgress: number;
  scanProgress: number;
  detectedCount: number;
  systemStatus: {
    wifiCSI: boolean;
    lidar: boolean;
    irSlam: boolean;
    orbSlam3: boolean;
  };
}

// 17-keypoint COCO format
export const KEYPOINT_CONNECTIONS: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4], // head
  [5, 6], // shoulders
  [5, 7], [7, 9], // left arm
  [6, 8], [8, 10], // right arm
  [5, 11], [6, 12], // torso
  [11, 12], // hips
  [11, 13], [13, 15], // left leg
  [12, 14], [14, 16], // right leg
];
