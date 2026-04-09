import { Scene3D } from '@/components/scene/Scene3D';
import { TelemetryPanel } from '@/components/panels/TelemetryPanel';
import { MissionTimeline } from '@/components/panels/MissionTimeline';
import { useSimulation } from '@/simulation/useSimulation';

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
        <div className="font-mono text-[9px] text-muted-foreground">
          SX1280 LINK: <span className="text-tactical-green">CONNECTED</span>
          <span className="mx-2">|</span>
          ESP32-S3: <span className="text-tactical-green">ONLINE</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1 relative">
          <Scene3D state={state} />
          {/* Overlay corners */}
          <div className="absolute top-2 left-2 font-mono text-[9px] text-tactical-dim pointer-events-none">
            <div>CAM: ORBIT FREE</div>
            <div>FPS: 60</div>
          </div>
        </div>

        {/* Telemetry Panel */}
        <TelemetryPanel state={state} />
      </div>

      {/* Mission Timeline */}
      <MissionTimeline state={state} onStart={startMission} onReset={resetMission} />
    </div>
  );
};

export default Index;
