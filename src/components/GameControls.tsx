import React from 'react';

interface GameControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isPlaying,
  isPaused,
  isGameOver,
  onStart,
  onPause,
  onRestart
}) => {
  return (
    <div className="game-controls">
      <div className="control-buttons">
        {!isPlaying || isGameOver ? (
          <button onClick={onStart} className="control-button start">
            {isGameOver ? 'Restart' : 'Start Game'}
          </button>
        ) : (
          <button onClick={onPause} className="control-button pause">
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        {(isPlaying || isGameOver) && (
          <button onClick={onRestart} className="control-button restart">
            New Game
          </button>
        )}
      </div>
      
      <div className="game-instructions">
        <h4>Controls</h4>
        <div className="instruction-grid">
          <div className="instruction">
            <span className="key">←/→</span>
            <span>Move</span>
          </div>
          <div className="instruction">
            <span className="key">↓</span>
            <span>Soft Drop</span>
          </div>
          <div className="instruction">
            <span className="key">Space</span>
            <span>Rotate</span>
          </div>
          <div className="instruction">
            <span className="key">Tab</span>
            <span>Hard Drop</span>
          </div>
          <div className="instruction">
            <span className="key">Esc</span>
            <span>Pause</span>
          </div>
          <div className="instruction">
            <span className="key">Enter</span>
            <span>Start/Resume</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 
