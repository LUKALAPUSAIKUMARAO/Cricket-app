'use client';

import { useMemo } from 'react';
import { InningsState, Player, BallInfo } from '@/store/useMatchStore';

export interface BatsmanStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  dots: number;
  strikeRate: number;
  dotPercent: number;
  isOut: boolean;
  contribution: number; // percentage of team total
}

export interface BowlerStats {
  id: string;
  name: string;
  overs: string;
  legalBalls: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
  figures: string;
}

export interface Partnership {
  bat1: string;
  bat2: string;
  runs: number;
  balls: number;
}

export interface OverData {
  over: number;
  runs: number;
  wickets: number;
  cumulative: number;
}

export function computeBattingStats(innings: InningsState, players: Player[]): BatsmanStats[] {
  const statsMap = new Map<string, BatsmanStats>();
  const teamTotal = innings.score || 1;

  // Initialize all players
  players.forEach(p => {
    statsMap.set(p.id, {
      id: p.id,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      dots: 0,
      strikeRate: 0,
      dotPercent: 0,
      isOut: false,
      contribution: 0,
    });
  });

  // Process each ball
  innings.balls.forEach(ball => {
    if (!ball.strikerId) return;
    const stat = statsMap.get(ball.strikerId);
    if (!stat) return;

    // Only count non-wide deliveries as balls faced
    const isWide = ball.extras.type === 'wide';
    if (!isWide) {
      stat.balls += 1;
      if (ball.runs === 0 && !ball.isWicket && ball.extras.type === 'none') {
        stat.dots += 1;
      }
    }

    stat.runs += ball.runs;
    if (ball.isBoundary && ball.runs === 4) stat.fours += 1;
    if (ball.isSix && ball.runs === 6) stat.sixes += 1;
    if (ball.isWicket) stat.isOut = true;
  });

  // Compute derived stats
  statsMap.forEach(stat => {
    stat.strikeRate = stat.balls > 0 ? (stat.runs / stat.balls) * 100 : 0;
    stat.dotPercent = stat.balls > 0 ? (stat.dots / stat.balls) * 100 : 0;
    stat.contribution = (stat.runs / teamTotal) * 100;
  });

  // Sort by runs descending, filter players who batted
  return Array.from(statsMap.values())
    .filter(s => s.balls > 0 || s.isOut)
    .sort((a, b) => b.runs - a.runs);
}

export function computeBowlingStats(innings: InningsState, bowlingTeamPlayers: Player[]): BowlerStats[] {
  const statsMap = new Map<string, { 
    id: string; name: string; legalBalls: number; runs: number; wickets: number; dots: number; 
    overBalls: Map<number, { runs: number; legal: number }>; 
  }>();

  bowlingTeamPlayers.forEach(p => {
    statsMap.set(p.id, {
      id: p.id,
      name: p.name,
      legalBalls: 0,
      runs: 0,
      wickets: 0,
      dots: 0,
      overBalls: new Map(),
    });
  });

  let currentOverNumber = 0;
  let ballsInOver = 0;

  innings.balls.forEach(ball => {
    if (!ball.bowlerId) return;
    const stat = statsMap.get(ball.bowlerId);
    if (!stat) return;

    const isLegal = !['wide', 'no-ball'].includes(ball.extras.type);
    let totalRuns = ball.runs + ball.extras.runs;
    if (['wide', 'no-ball'].includes(ball.extras.type)) totalRuns += 1;

    stat.runs += totalRuns;
    if (isLegal) {
      stat.legalBalls += 1;
      if (totalRuns === 0) stat.dots += 1;
    }
    if (ball.isWicket) stat.wickets += 1;

    // Track per-over data for maidens
    if (!stat.overBalls.has(currentOverNumber)) {
      stat.overBalls.set(currentOverNumber, { runs: 0, legal: 0 });
    }
    const overData = stat.overBalls.get(currentOverNumber)!;
    overData.runs += totalRuns;
    if (isLegal) overData.legal += 1;

    if (isLegal) {
      ballsInOver += 1;
      if (ballsInOver === 6) {
        ballsInOver = 0;
        currentOverNumber += 1;
      }
    }
  });

  return Array.from(statsMap.values())
    .filter(s => s.legalBalls > 0)
    .map(s => {
      const overs = Math.floor(s.legalBalls / 6);
      const remainBalls = s.legalBalls % 6;
      const oversStr = `${overs}.${remainBalls}`;
      const oversDecimal = overs + remainBalls / 6;
      const economy = oversDecimal > 0 ? s.runs / oversDecimal : 0;
      
      let maidens = 0;
      s.overBalls.forEach(od => {
        if (od.legal === 6 && od.runs === 0) maidens += 1;
      });

      return {
        id: s.id,
        name: s.name,
        overs: oversStr,
        legalBalls: s.legalBalls,
        maidens,
        runs: s.runs,
        wickets: s.wickets,
        economy: Math.round(economy * 100) / 100,
        dots: s.dots,
        figures: `${s.wickets}/${s.runs}`,
      };
    })
    .sort((a, b) => b.wickets - a.wickets || a.economy - b.economy);
}

export function computeOverByOver(innings: InningsState): OverData[] {
  const overs: OverData[] = [];
  let ballCount = 0;
  let currentOver = 0;
  let runsThisOver = 0;
  let wicketsThisOver = 0;
  let cumulativeRuns = 0;

  innings.balls.forEach(ball => {
    const isLegal = !['wide', 'no-ball'].includes(ball.extras.type);
    let totalRuns = ball.runs + ball.extras.runs;
    if (['wide', 'no-ball'].includes(ball.extras.type)) totalRuns += 1;

    runsThisOver += totalRuns;
    cumulativeRuns += totalRuns;
    if (ball.isWicket) wicketsThisOver += 1;

    if (isLegal) {
      ballCount += 1;
      if (ballCount % 6 === 0) {
        overs.push({
          over: currentOver + 1,
          runs: runsThisOver,
          wickets: wicketsThisOver,
          cumulative: cumulativeRuns,
        });
        currentOver += 1;
        runsThisOver = 0;
        wicketsThisOver = 0;
      }
    }
  });

  // Partial over
  if (ballCount % 6 !== 0) {
    overs.push({
      over: currentOver + 1,
      runs: runsThisOver,
      wickets: wicketsThisOver,
      cumulative: cumulativeRuns,
    });
  }

  return overs;
}

export function computePartnerships(innings: InningsState, players: Player[]): Partnership[] {
  const partnerships: Partnership[] = [];
  let currentRuns = 0;
  let currentBalls = 0;
  let bat1Id: string | null = null;
  let bat2Id: string | null = null;

  innings.balls.forEach(ball => {
    const striker = ball.strikerId;
    
    if (!bat1Id && striker) bat1Id = striker;
    if (bat1Id && !bat2Id && striker && striker !== bat1Id) bat2Id = striker;
    
    const isLegal = !['wide', 'no-ball'].includes(ball.extras.type);
    let totalRuns = ball.runs + ball.extras.runs;
    if (['wide', 'no-ball'].includes(ball.extras.type)) totalRuns += 1;

    currentRuns += totalRuns;
    if (isLegal) currentBalls += 1;

    if (ball.isWicket && currentBalls > 0) {
      const name1 = players.find(p => p.id === bat1Id)?.name || '?';
      const name2 = players.find(p => p.id === bat2Id)?.name || '?';
      partnerships.push({ bat1: name1, bat2: name2, runs: currentRuns, balls: currentBalls });
      currentRuns = 0;
      currentBalls = 0;
      // Reset for next partnership
      if (bat1Id === striker) bat1Id = bat2Id;
      bat2Id = null;
    }
  });

  // Final unbroken partnership
  if (currentBalls > 0) {
    const name1 = players.find(p => p.id === bat1Id)?.name || '?';
    const name2 = players.find(p => p.id === bat2Id)?.name || '?';
    partnerships.push({ bat1: name1, bat2: name2, runs: currentRuns, balls: currentBalls });
  }

  return partnerships.sort((a, b) => b.runs - a.runs);
}

export interface POTMCandidate {
  id: string;
  name: string;
  team: string;
  impactScore: number;
  battingRuns: number;
  battingSR: number;
  bowlingWickets: number;
  bowlingEco: number;
  isWinner: boolean;
  breakdown: { label: string; value: number }[];
}

export function computePOTM(
  firstInnings: InningsState,
  secondInnings: InningsState,
  teamAPlayers: Player[],
  teamBPlayers: Player[],
  teamA: string,
  teamB: string,
  winningTeam: string | null,
): POTMCandidate | null {
  const allPlayers = [
    ...teamAPlayers.map(p => ({ ...p, team: teamA })),
    ...teamBPlayers.map(p => ({ ...p, team: teamB })),
  ];

  const candidates: POTMCandidate[] = allPlayers.map(player => {
    let score = 0;
    const breakdown: { label: string; value: number }[] = [];

    // Batting contribution — check both innings
    const allBalls = [...firstInnings.balls, ...secondInnings.balls];
    const batBalls = allBalls.filter(b => b.strikerId === player.id);
    const batRuns = batBalls.reduce((s, b) => s + b.runs, 0);
    const batFaced = batBalls.filter(b => b.extras.type !== 'wide').length;
    const batSR = batFaced > 0 ? (batRuns / batFaced) * 100 : 0;
    const fours = batBalls.filter(b => b.isBoundary && b.runs === 4).length;
    const sixes = batBalls.filter(b => b.isSix && b.runs === 6).length;

    const runPoints = batRuns * 1;
    score += runPoints;
    if (runPoints > 0) breakdown.push({ label: 'Batting Runs', value: runPoints });

    const srBonus = batSR > 200 ? 30 : batSR > 150 ? 15 : 0;
    score += srBonus;
    if (srBonus > 0) breakdown.push({ label: 'SR Bonus', value: srBonus });

    const boundaryPoints = fours * 2 + sixes * 3;
    score += boundaryPoints;
    if (boundaryPoints > 0) breakdown.push({ label: 'Boundaries', value: boundaryPoints });

    // Bowling contribution
    const bowlBalls = allBalls.filter(b => b.bowlerId === player.id);
    const bowlWickets = bowlBalls.filter(b => b.isWicket).length;
    const bowlRuns = bowlBalls.reduce((s, b) => {
      let r = b.runs + b.extras.runs;
      if (['wide', 'no-ball'].includes(b.extras.type)) r += 1;
      return s + r;
    }, 0);
    const bowlLegal = bowlBalls.filter(b => !['wide', 'no-ball'].includes(b.extras.type)).length;
    const bowlOvers = bowlLegal / 6;
    const bowlEco = bowlOvers > 0 ? bowlRuns / bowlOvers : 99;
    const bowlDots = bowlBalls.filter(b => {
      const isLegal = !['wide', 'no-ball'].includes(b.extras.type);
      const totalR = b.runs + b.extras.runs + (['wide', 'no-ball'].includes(b.extras.type) ? 1 : 0);
      return isLegal && totalR === 0;
    }).length;

    const wicketPoints = bowlWickets * 25;
    score += wicketPoints;
    if (wicketPoints > 0) breakdown.push({ label: 'Wickets', value: wicketPoints });

    const ecoBonus = bowlOvers >= 1 ? (bowlEco < 4 ? 20 : bowlEco < 6 ? 10 : 0) : 0;
    score += ecoBonus;
    if (ecoBonus > 0) breakdown.push({ label: 'Economy Bonus', value: ecoBonus });

    const dotPoints = bowlDots * 1;
    score += dotPoints;
    if (dotPoints > 0) breakdown.push({ label: 'Dot Balls', value: dotPoints });

    if (bowlWickets >= 3) {
      score += 20;
      breakdown.push({ label: '3+ Wickets', value: 20 });
    }

    // Winner bonus
    const isWinner = winningTeam === player.team;
    if (isWinner) {
      score += 20;
      breakdown.push({ label: 'Winner Bonus', value: 20 });
    }

    return {
      id: player.id,
      name: player.name,
      team: player.team,
      impactScore: Math.round(score),
      battingRuns: batRuns,
      battingSR: Math.round(batSR),
      bowlingWickets: bowlWickets,
      bowlingEco: Math.round(bowlEco * 100) / 100,
      isWinner,
      breakdown: breakdown.sort((a, b) => b.value - a.value),
    };
  });

  candidates.sort((a, b) => b.impactScore - a.impactScore);
  return candidates.length > 0 ? candidates[0] : null;
}
