import React from 'react';
import { useGame } from '../useGame';
import { useInput } from '../useInput';
import { Board } from './Board';
import { NextPiece } from './NextPiece';
import { GameStats } from './GameStats';
import { GameControls } from './GameControls';
import { GameOverlay } from './GameOverlay';

export const Tetris: React.FC = () => {
  const { gameState, dispatch, actions } = useGame();
  
  // Set up input handling
  useInput({
    onAction: dispatch,
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    isGameOver: gameState.isGameOver
  });

  const gameStats = {
    score: gameState.score,
    level: gameState.level,
    lines: gameState.lines
  };

  return (
    <div className="tetris-game">
      <div className="game-container">
        <div className="game-main">
          <div className="game-area">
            <Board 
              board={gameState.board} 
              currentPiece={gameState.currentPiece} 
            />
            <GameOverlay
              isPlaying={gameState.isPlaying}
              isPaused={gameState.isPaused}
              isGameOver={gameState.isGameOver}
              score={gameState.score}
              onStart={actions.startGame}
              onRestart={actions.restartGame}
            />
          </div>
        </div>
        
        <div className="game-sidebar">
          <NextPiece nextPiece={gameState.nextPiece} />
          <GameStats stats={gameStats} />
          <GameControls
            isPlaying={gameState.isPlaying}
            isPaused={gameState.isPaused}
            isGameOver={gameState.isGameOver}
            onStart={actions.startGame}
            onPause={actions.pauseGame}
            onRestart={actions.restartGame}
          />
        </div>
      </div>
    </div>
  );
}; 
