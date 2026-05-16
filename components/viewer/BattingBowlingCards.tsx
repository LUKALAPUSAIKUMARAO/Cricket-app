'use client';
import { useMatchStore } from '@/store/useMatchStore';
import { computeBattingStats, computeBowlingStats } from '@/lib/matchStats';

export function BattingBowlingCards() {
  const { setup, currentInnings, firstInnings, secondInnings } = useMatchStore();

  if (!setup) return null;

  const currentStats = currentInnings === 1 ? firstInnings : secondInnings!;
  const battingTeamPlayers = currentInnings === 1 ? setup.teamAPlayers : setup.teamBPlayers;
  const bowlingTeamPlayers = currentInnings === 1 ? setup.teamBPlayers : setup.teamAPlayers;

  const battingStats = computeBattingStats(currentStats, battingTeamPlayers);
  const bowlingStats = computeBowlingStats(currentStats, bowlingTeamPlayers);

  // We only want to show current batsmen (striker and non-striker) or recent ones if none selected
  // But wait, the viewer should just show the striker and non-striker.
  const strikerStat = battingStats.find(s => s.id === currentStats.strikerId);
  const nonStrikerStat = battingStats.find(s => s.id === currentStats.nonStrikerId);
  
  const currentBatsmen = [strikerStat, nonStrikerStat].filter(Boolean) as typeof battingStats;
  const currentBowler = bowlingStats.find(s => s.id === currentStats.currentBowlerId);

  return (
    <div className="mx-4 mt-4 space-y-4">
      {/* Batting Card */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
        <div className="bg-black/5 dark:bg-white/5 px-4 py-2 border-b border-black/5 dark:border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Batters</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02]">
              <tr className="text-[10px] text-foreground/70 uppercase tracking-wider text-right border-b border-black/5 dark:border-white/5">
                <th className="font-medium pb-2 pt-2 px-4 text-left">Batsman</th>
                <th className="font-medium pb-2 pt-2 w-10">R</th>
                <th className="font-medium pb-2 pt-2 w-10">B</th>
                <th className="font-medium pb-2 pt-2 w-8">4s</th>
                <th className="font-medium pb-2 pt-2 w-8">6s</th>
                <th className="font-medium pb-2 pt-2 px-4 w-16">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono text-xs">
              {currentBatsmen.length > 0 ? currentBatsmen.map((bat, idx) => (
                <tr key={bat.id} className="text-right hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-left font-sans text-sm font-bold flex items-center space-x-2">
                    <span className="truncate max-w-[100px] text-foreground">{bat.name}</span>
                    {bat.id === currentStats.strikerId && (
                      <span className="text-primary text-lg leading-none mt-1">*</span>
                    )}
                  </td>
                  <td className="py-3 font-bold text-foreground">{bat.runs}</td>
                  <td className="py-3 text-foreground/80 font-medium">{bat.balls}</td>
                  <td className="py-3 text-foreground/80 font-medium">{bat.fours}</td>
                  <td className="py-3 text-foreground/80 font-medium">{bat.sixes}</td>
                  <td className="py-3 px-4 text-foreground/80 font-medium">{bat.strikeRate.toFixed(1)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-xs text-foreground/50 italic font-medium">
                    Batsmen not at crease
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowling Card */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-black/5 dark:border-white/5">
        <div className="bg-black/5 dark:bg-white/5 px-4 py-2 border-b border-black/5 dark:border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Bowler</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02]">
              <tr className="text-[10px] text-foreground/70 uppercase tracking-wider text-right border-b border-black/5 dark:border-white/5">
                <th className="font-medium pb-2 pt-2 px-4 text-left">Bowler</th>
                <th className="font-medium pb-2 pt-2 w-12">O</th>
                <th className="font-medium pb-2 pt-2 w-10">R</th>
                <th className="font-medium pb-2 pt-2 w-10">W</th>
                <th className="font-medium pb-2 pt-2 px-4 w-16">ECO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 font-mono text-xs">
              {currentBowler ? (
                <tr className="text-right hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-left font-sans text-sm font-bold flex items-center space-x-2">
                    <span className="truncate max-w-[120px] text-foreground">{currentBowler.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  </td>
                  <td className="py-3 text-foreground/80 font-medium">{currentBowler.overs}</td>
                  <td className="py-3 font-bold text-foreground">{currentBowler.runs}</td>
                  <td className="py-3 font-bold text-primary">{currentBowler.wickets}</td>
                  <td className="py-3 px-4 text-foreground/80 font-medium">{currentBowler.economy.toFixed(1)}</td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-xs text-foreground/50 italic font-medium">
                    Waiting for bowler
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
