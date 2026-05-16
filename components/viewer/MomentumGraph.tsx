'use client';
import { useMatchStore } from '@/store/useMatchStore';
import { computeOverByOver } from '@/lib/matchStats';

export function MomentumGraph() {
  const { currentInnings, firstInnings, secondInnings, setup } = useMatchStore();

  if (!setup) return null;

  const currentStats = currentInnings === 1 ? firstInnings : secondInnings!;
  const overData = computeOverByOver(currentStats);

  const teamColor = currentInnings === 1 ? setup.teamAColor : setup.teamBColor;
  
  // Find max runs in a single over to scale the graph
  const maxRuns = Math.max(15, ...overData.map(o => o.runs)); // minimum scale is 15 runs

  return (
    <div className="mx-4 mt-4 mb-20 glass-panel rounded-2xl p-4 border border-black/5 dark:border-white/5">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70 mb-4">Momentum (Runs per Over)</h3>
      
      {overData.length > 0 ? (
        <div className="relative h-40 flex items-end space-x-1.5 pt-4">
          {/* Horizontal lines for reference */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
            <div className="w-full border-b border-black dark:border-white border-dashed h-0" />
            <div className="w-full border-b border-black dark:border-white border-dashed h-0" />
            <div className="w-full border-b border-black dark:border-white border-dashed h-0" />
          </div>

          <div className="absolute top-0 left-0 text-[8px] text-foreground/70">{maxRuns}</div>
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[8px] text-foreground/70">{Math.floor(maxRuns/2)}</div>

          {/* Bars */}
          <div className="w-full h-full flex items-end space-x-1.5 pl-4 overflow-x-auto no-scrollbar pb-1">
            {overData.map((data, idx) => {
              const heightPercent = (data.runs / maxRuns) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-shrink-0 w-6 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/80 text-white text-[9px] px-2 py-1 rounded-md transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    Over {data.over}: {data.runs} runs {data.wickets > 0 ? `(${data.wickets}W)` : ''}
                  </div>
                  
                  {/* Wicket Indicators on top of bar */}
                  {data.wickets > 0 && (
                    <div className="flex space-x-0.5 mb-1">
                      {Array.from({ length: Math.min(3, data.wickets) }).map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      ))}
                    </div>
                  )}
                  
                  {/* Bar */}
                  <div 
                    className="w-full rounded-t-sm transition-all duration-500 group-hover:opacity-80"
                    style={{ 
                      height: `${Math.max(2, heightPercent)}%`, // at least 2% height so empty overs show
                      backgroundColor: teamColor || '#3b82f6',
                      opacity: 0.7 + (data.runs / maxRuns) * 0.3 // brighter for bigger overs
                    }}
                  />
                  
                  {/* Label */}
                  <div className="text-[9px] text-foreground/70 mt-1 font-mono">
                    {data.over}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center text-xs text-foreground/50 italic font-medium">
          Not enough data yet
        </div>
      )}
    </div>
  );
}
