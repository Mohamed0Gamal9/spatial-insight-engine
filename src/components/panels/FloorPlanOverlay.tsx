import { SimulationState } from '@/simulation/types';

interface FloorPlanOverlayProps {
  state: SimulationState;
}

const ROOM_LABELS = [
  { x: 22, y: 35, label: 'A' },
  { x: 50, y: 45, label: 'B' },
  { x: 78, y: 38, label: 'C' },
];

// Map 3D coords to 2D minimap (approx)
function to2D(pos: [number, number, number]): { x: number; y: number } {
  return {
    x: ((pos[0] + 5) / 10) * 100,
    y: ((pos[2] + 4) / 8) * 100,
  };
}

export function FloorPlanOverlay({ state }: FloorPlanOverlayProps) {
  if (state.mappingProgress < 0.3) return null;

  const dronePos = to2D(state.drone.position);

  return (
    <div className="absolute bottom-2 left-2 w-36 h-28 pointer-events-none">
      <div className="w-full h-full border border-border rounded-sm bg-card/80 backdrop-blur-sm overflow-hidden relative">
        {/* Title */}
        <div className="absolute top-1 left-1.5 font-mono text-[7px] text-muted-foreground tracking-wider">FLOOR PLAN</div>

        {/* Building outline */}
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ padding: '8px 4px 4px 4px' }}>
          {/* Outer walls */}
          <rect x="5" y="10" width="90" height="80" fill="none" stroke="hsl(var(--tactical-green))" strokeWidth="1" opacity={0.6} />

          {/* Interior walls */}
          {state.mappingProgress > 0.3 && (
            <>
              <line x1="35" y1="10" x2="35" y2="70" stroke="hsl(var(--tactical-green))" strokeWidth="0.7" opacity={0.4} />
              <line x1="70" y1="20" x2="70" y2="90" stroke="hsl(var(--tactical-green))" strokeWidth="0.7" opacity={0.4} />
            </>
          )}

          {/* Room labels */}
          {ROOM_LABELS.map((r, i) => (
            state.mappingProgress > 0.35 + i * 0.2 && (
              <text key={i} x={r.x} y={r.y} fill="hsl(var(--tactical-green))" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity={0.5}>
                {r.label}
              </text>
            )
          ))}

          {/* Persons */}
          {state.persons.map((p, i) => {
            if (!p.visible) return null;
            const pos = to2D(p.position);
            const colors = ['#00e68a', '#00ccff', '#ffaa00', '#ff6666'];
            return (
              <circle key={p.id} cx={pos.x} cy={pos.y} r="3" fill={colors[i % colors.length]} opacity={0.8}>
                <animate attributeName="r" values="2;3.5;2" dur="2s" repeatCount="indefinite" />
              </circle>
            );
          })}

          {/* Drone */}
          <g transform={`translate(${dronePos.x},${dronePos.y})`}>
            <circle r="2" fill="#00ccff" opacity={0.9} />
            <circle r="5" fill="none" stroke="#00ccff" strokeWidth="0.5" opacity={0.4}>
              <animate attributeName="r" values="3;7;3" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>
    </div>
  );
}
