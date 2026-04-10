import { Scene3D } from '@/components/scene/Scene3D';
import { TelemetryPanel } from '@/components/panels/TelemetryPanel';
import { MissionTimeline } from '@/components/panels/MissionTimeline';
import { useSimulation } from '@/simulation/useSimulation';

const ROOM_NAMES = ['', 'ROOM A', 'ROOM B', 'ROOM C'];

const Index = () => {
  const { state, startMission, resetMission } = useSimulation();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden scanline">
      {/* Top bar */}
      <div className="h-8 bg-card border-b border-border flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-tactical-green animate-pulse-glow" />
          <span className="font-mono text-[10px] text-primary tracking-[0.2em] text-glow-green">
            WIFI-CSI DRONE GCS
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground">
          {state.phase === 'sensing' && state.drone.currentRoom > 0 && (
            <span className="px-2 py-0.5 rounded-sm bg-tactical-cyan/15 text-tactical-cyan border border-tactical-cyan/30 tracking-wider">
              SCANNING {ROOM_NAMES[state.drone.currentRoom]}
            </span>
          )}
          <span>
            SX1280 LINK: <span className="text-tactical-green">CONNECTED</span>
            <span className="mx-2">|</span>
            ESP32-S3: <span className="text-tactical-green">ONLINE</span>
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <Scene3D state={state} />
          <div className="absolute top-2 left-2 font-mono text-[9px] text-tactical-dim pointer-events-none">
            <div>CAM: ORBIT FREE</div>
            <div>FPS: 60</div>
          </div>
        </div>
        <TelemetryPanel state={state} />
      </div>

      <MissionTimeline state={state} onStart={startMission} onReset={resetMission} />
    </div>
  );
};

export default Index;
