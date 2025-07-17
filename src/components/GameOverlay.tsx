import React from 'react';

interface GameOverlayProps {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  onStart: () => void;
  onRestart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  isPlaying,
  isPaused,
  isGameOver,
  score,
  onStart,
  onRestart
}) => {
  if (isPlaying && !isPaused && !isGameOver) {
    return null; // No overlay during normal gameplay
  }

  return (
    <div className="game-overlay">
      <div className="overlay-content">
        {!isPlaying && !isGameOver && (
          <>
            <h1>Vibe Tetris</h1>
            <p>Press Enter to start playing!</p>
            <button onClick={onStart} className="overlay-button">
              Start Game
            </button>
          </>
        )}
        
        {isPaused && !isGameOver && (
          <>
            <h2>Paused</h2>
            <p>Press Escape or Enter to resume</p>
          </>
        )}
        
        {isGameOver && (
          <>
            <h2>Game Over</h2>
            <p>Final Score: {score.toLocaleString()}</p>
            <button onClick={onRestart} className="overlay-button">
              Play Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}; 
