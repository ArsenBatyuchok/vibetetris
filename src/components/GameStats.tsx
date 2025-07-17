import React from 'react';
import type { GameStats as GameStatsType } from '../types';

interface GameStatsProps {
  stats: GameStatsType;
}

export const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  return (
    <div className="game-stats">
      <div className="stat-item">
        <label>Score</label>
        <span>{stats.score.toLocaleString()}</span>
      </div>
      <div className="stat-item">
        <label>Level</label>
        <span>{stats.level}</span>
      </div>
      <div className="stat-item">
        <label>Lines</label>
        <span>{stats.lines}</span>
      </div>
    </div>
  );
}; 
