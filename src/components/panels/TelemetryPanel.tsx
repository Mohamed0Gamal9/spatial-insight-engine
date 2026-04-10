import { SimulationState } from '@/simulation/types';

interface TelemetryPanelProps {
  state: SimulationState;
}

const PERSON_COLORS = ['text-tactical-green', 'text-tactical-cyan', 'text-tactical-amber', 'text-tactical-red'];

export function TelemetryPanel({ state }: TelemetryPanelProps) {
  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h2 className="font-mono text-xs text-primary tracking-widest text-glow-green">GROUND STATION v6.0</h2>
        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">WiFi CSI Drone System</p>
      </div>

      {/* System Status */}
      <div className="p-3 border-b border-border">
        <h3 className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">SYSTEM STATUS</h3>
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
          <StatusBadge label="WiFi CSI" active={state.systemStatus.wifiCSI} />
          <StatusBadge label="IR SLAM" active={state.systemStatus.irSlam} />
          <StatusBadge label="LiDAR" active={state.systemStatus.lidar} />
          <StatusBadge label="ORB-SLAM3" active={state.systemStatus.orbSlam3} />
        </div>
      </div>

      {/* Drone Info */}
      <div className="p-3 border-b border-border">
        <h3 className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">DRONE TELEMETRY</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
          <span className="text-muted-foreground">Mode</span>
          <span className="text-primary">{state.drone.mode}</span>
          <span className="text-muted-foreground">Battery</span>
          <span className={state.drone.battery < 30 ? 'text-tactical-red' : 'text-tactical-green'}>{state.drone.battery}%</span>
          <span className="text-muted-foreground">Altitude</span>
          <span className="text-tactical-cyan">{state.drone.altitude}m</span>
          <span className="text-muted-foreground">Position</span>
          <span className="text-foreground text-[9px]">
            ({state.drone.position.map(v => v.toFixed(1)).join(', ')})
          </span>
        </div>
      </div>

      {/* Mapping Progress */}
      {state.phase === 'mapping' && (
        <div className="p-3 border-b border-border">
          <h3 className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">MAPPING PROGRESS</h3>
          <div className="w-full h-2 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-tactical-green transition-all duration-300"
              style={{ width: `${Math.round(state.mappingProgress * 100)}%` }}
            />
          </div>
          <div className="font-mono text-[9px] text-tactical-green mt-1">{Math.round(state.mappingProgress * 100)}%</div>
        </div>
      )}

      {/* Detected Persons */}
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2">
          DETECTED PERSONS ({state.detectedCount}/{state.persons.length})
        </h3>
        <div className="space-y-2">
          {state.persons.map((person, i) => (
            <PersonCard key={person.id} person={person} colorClass={PERSON_COLORS[i % PERSON_COLORS.length]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-sm bg-muted`}>
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-tactical-green animate-pulse-glow' : 'bg-tactical-red'}`} />
      <span className={active ? 'text-foreground' : 'text-tactical-red'}>{label}</span>
    </div>
  );
}

function PersonCard({ person, colorClass }: { person: SimulationState['persons'][0]; colorClass: string }) {
  if (!person.visible) {
    return (
      <div className="border border-border rounded-md p-2 opacity-30">
        <div className="font-mono text-[10px] text-muted-foreground">{person.name}</div>
        <div className="font-mono text-[9px] text-tactical-dim">Scanning...</div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-md p-2 bg-muted/30">
      <div className={`font-mono text-[11px] font-semibold ${colorClass} mb-1`}>
        {person.name}
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 font-mono text-[9px]">
        <span className="text-muted-foreground">Activity</span>
        <span className="text-foreground">{person.activity}</span>
        <span className="text-muted-foreground">Heart Rate</span>
        <span className="text-tactical-red">{person.heartRate} BPM <span className="text-tactical-dim">±2</span></span>
        <span className="text-muted-foreground">Breath Rate</span>
        <span className="text-tactical-cyan">{person.breathRate} BPM <span className="text-tactical-dim">±1</span></span>
        <span className="text-muted-foreground">Confidence</span>
        <span className="text-tactical-green flex items-center gap-1">
          {person.confidence}%
          <span className="inline-block w-8 h-1 bg-muted rounded-sm overflow-hidden">
            <span className="block h-full bg-tactical-green" style={{ width: `${person.confidence}%` }} />
          </span>
        </span>
        <span className="text-muted-foreground">Keypoints</span>
        <span className="text-foreground">17 · 30 FPS</span>
        <span className="text-muted-foreground">Position</span>
        <span className="text-foreground text-[8px]">({person.position.map(v => v.toFixed(1)).join(', ')})</span>
        <span className="text-muted-foreground">Room</span>
        <span className="text-tactical-amber">Room {String.fromCharCode(64 + person.room)}</span>
      </div>
    </div>
  );
}
