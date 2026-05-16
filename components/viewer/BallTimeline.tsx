'use client';
import { useMatchStore } from '@/store/useMatchStore';

export function BallTimeline() {
  const { currentInnings, firstInnings, secondInnings, setup } = useMatchStore();

  if (!setup) return null;

  const currentStats = currentInnings === 1 ? firstInnings : secondInnings!;
  
  // Last 6 balls for horizontal view
  const recentBalls = [...currentStats.balls].slice(-6);

  // Last 10 balls for vertical commentary
  const commentaryBalls = [...currentStats.balls].slice(-10).reverse();

  const getBallText = (ball: typeof recentBalls[0]) => {
    if (ball.isWicket) return 'W';
    if (ball.isBoundary && ball.runs === 4) return '4';
    if (ball.isSix && ball.runs === 6) return '6';
    if (ball.extras.type !== 'none') {
      const type = ball.extras.type === 'wide' ? 'wd' : ball.extras.type === 'no-ball' ? 'nb' : 'lb';
      return `${ball.runs + ball.extras.runs}${type}`;
    }
    return ball.runs.toString();
  };

  const getBallColor = (ball: typeof recentBalls[0]) => {
    if (ball.isWicket) return 'bg-destructive text-destructive-foreground shadow-[0_0_15px_rgba(220,38,38,0.4)] border-destructive/50';
    if (ball.isBoundary && ball.runs === 4) return 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border-blue-400/50';
    if (ball.isSix && ball.runs === 6) return 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)] border-purple-400/50';
    if (ball.extras.type !== 'none') return 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] border-amber-400/50';
    return 'bg-secondary/40 text-secondary-foreground border-black/5 dark:border-white/5';
  };

  const getCommentaryText = (ball: typeof recentBalls[0]) => {
    const bowler = setup.teamAPlayers.concat(setup.teamBPlayers).find(p => p.id === ball.bowlerId)?.name || 'Bowler';
    const striker = setup.teamAPlayers.concat(setup.teamBPlayers).find(p => p.id === ball.strikerId)?.name || 'Batsman';
    
    if (ball.isWicket) return <span className="text-destructive font-bold">OUT! WICKET! {striker} is gone.</span>;
    if (ball.isBoundary && ball.runs === 4) return <span className="text-blue-400 font-bold">FOUR! Beautiful shot by {striker}.</span>;
    if (ball.isSix && ball.runs === 6) return <span className="text-purple-400 font-bold">SIX! Huge hit into the stands by {striker}!</span>;
    if (ball.extras.type !== 'none') return <span className="text-amber-400">{ball.extras.type.replace('-', ' ')} called. Extra runs given.</span>;
    if (ball.runs === 0) return <span className="text-foreground/70">Dot ball. Good delivery by {bowler}.</span>;
    return <span>{ball.runs} run{ball.runs > 1 ? 's' : ''} taken by {striker}.</span>;
  };

  return (
    <div className="mx-4 mt-4 space-y-4">
      {/* Last Over Horizontal */}
      <div className="glass-panel rounded-2xl p-4 border border-black/5 dark:border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70 mb-3">Last Over</h3>
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-1">
          {recentBalls.length > 0 ? (
            recentBalls.map((ball) => (
              <div key={ball.id} className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black shrink-0 ${getBallColor(ball)} border shadow-sm transition-transform duration-300 hover:scale-110`}>
                {getBallText(ball)}
              </div>
            ))
          ) : (
            <span className="text-xs text-foreground/50 italic font-medium">No balls bowled yet</span>
          )}
        </div>
      </div>

      {/* Commentary */}
      <div className="glass-panel rounded-2xl p-4 border border-black/5 dark:border-white/5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/70 mb-4">Live Commentary</h3>
        <div className="space-y-4">
          {commentaryBalls.length > 0 ? (
            commentaryBalls.map((ball, index) => {
              // Calculate over.ball roughly for commentary display
              // Since we don't store exactly over.ball, we compute it by index from the end
              const ballIndex = currentStats.balls.length - 1 - index;
              const legalBallsBefore = currentStats.balls.slice(0, ballIndex).filter(b => !['wide', 'no-ball'].includes(b.extras.type)).length;
              const overNo = Math.floor(legalBallsBefore / 6);
              const ballNo = (legalBallsBefore % 6) + 1;
              const isLegal = !['wide', 'no-ball'].includes(ball.extras.type);

              return (
                <div key={ball.id} className="flex items-start space-x-3 text-sm">
                  <div className="flex-shrink-0 w-12 text-[11px] font-mono font-bold text-foreground/70 mt-0.5">
                    {overNo}.{isLegal ? ballNo : ballNo - 1}
                  </div>
                  <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${getBallColor(ball)} border`}>
                    {getBallText(ball)}
                  </div>
                  <div className="flex-1 text-foreground/90 leading-snug pt-0.5">
                    {getCommentaryText(ball)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-foreground/50 italic font-medium text-center py-4">Match about to begin...</div>
          )}
        </div>
      </div>
    </div>
  );
}
