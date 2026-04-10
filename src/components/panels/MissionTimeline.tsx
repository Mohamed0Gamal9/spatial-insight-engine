import { SimulationState, MissionPhase } from '@/simulation/types';

interface MissionTimelineProps {
  state: SimulationState;
  onStart: () => void;
  onReset: () => void;
}

const PHASES: { key: MissionPhase; label: string; icon: string }[] = [
  { key: 'launch', label: 'LAUNCH', icon: '🚀' },
  { key: 'mapping', label: 'MAPPING', icon: '🗺️' },
  { key: 'sensing', label: 'SENSING', icon: '📡' },
  { key: 'complete', label: 'COMPLETE', icon: '✅' },
];

export function MissionTimeline({ state, onStart, onReset }: MissionTimelineProps) {
  const phaseIdx = PHASES.findIndex(p => p.key === state.phase);

  return (
    <div className="h-14 bg-card border-t border-border flex items-center px-4 gap-4">
      {/* Control button */}
      {state.phase === 'idle' ? (
        <button
          onClick={onStart}
          className="font-mono text-xs px-4 py-2 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors glow-green tracking-wider"
        >
          START MISSION
        </button>
      ) : (
        <button
          onClick={onReset}
          className="font-mono text-xs px-4 py-2 bg-muted text-muted-foreground rounded-sm hover:bg-muted/80 transition-colors tracking-wider"
        >
          RESET
        </button>
      )}

      {/* Phase indicators */}
      <div className="flex-1 flex items-center gap-1">
        {PHASES.map((phase, i) => {
          const isActive = phase.key === state.phase;
          const isDone = phaseIdx > i;
          return (
            <div key={phase.key} className="flex items-center flex-1">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-mono tracking-wider transition-all ${
                isActive ? 'bg-primary/20 text-primary border border-primary/50' :
                isDone ? 'bg-muted text-tactical-green' :
                'bg-muted/30 text-tactical-dim'
              }`}>
                <span>{phase.icon}</span>
                <span>{phase.label}</span>
              </div>
              {i < PHASES.length - 1 && (
                <div className={`flex-1 h-px mx-1 ${isDone ? 'bg-tactical-green' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bars + subjects */}
      <div className="flex items-center gap-3 font-mono text-[10px]">
        <div className="text-muted-foreground">
          MAP: <span className="text-tactical-cyan">{Math.round(state.mappingProgress * 100)}%</span>
        </div>
        <div className="text-muted-foreground">
          SCAN: <span className="text-tactical-green">{Math.round(state.scanProgress * 100)}%</span>
        </div>
        <div className="text-muted-foreground">
          SUBJ: <span className="text-tactical-amber">{state.detectedCount}/{state.persons.length}</span>
        </div>
      </div>
    </div>
  );
}
