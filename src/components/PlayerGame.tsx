import React from 'react';
import type { Player } from '../types';
import { PIECE_COLORS } from '../constants';
import { placePieceOnBoard, getBoardWithGhost } from '../gameBoard';

interface PlayerGameProps {
  player: Player;
  isCurrentPlayer: boolean;
}

export const PlayerGame: React.FC<PlayerGameProps> = ({ player, isCurrentPlayer }) => {
  const { username, emoji, gameState } = player;
  
  // Create display board with current piece and ghost piece
  let displayBoard = [...gameState.board.map(row => [...row])];
  
  // Add ghost piece (only for current player)
  if (isCurrentPlayer && gameState.currentPiece) {
    displayBoard = getBoardWithGhost(displayBoard, gameState.currentPiece, gameState.currentPiece);
  }
  
  // Add current piece
  if (gameState.currentPiece) {
    displayBoard = placePieceOnBoard(displayBoard, gameState.currentPiece);
  }

  return (
    <div className={`player-game ${isCurrentPlayer ? 'current-player' : ''}`}>
      <div className="player-header">
        <div className="player-info">
          <span className="player-emoji">{emoji}</span>
          <span className="player-username">{username}</span>
        </div>
        <div className="next-piece-mini">
          <span className="next-label">Next</span>
          <div className="next-piece-preview">
            {gameState.nextPiece && gameState.nextPiece.shape.map((row, y) => (
              <div key={y} className="next-row">
                {row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`next-cell ${cell ? 'filled' : ''}`}
                    style={{
                      backgroundColor: cell ? PIECE_COLORS[gameState.nextPiece!.type] : 'transparent'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="game-stats-mini">
        <div className="stat">
          <span className="stat-label">Score</span>
          <span className="stat-value">{gameState.score.toString().padStart(3, '0')}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Level</span>
          <span className="stat-value">{gameState.level.toString().padStart(3, '0')}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Place</span>
          <span className="stat-value">0</span>
        </div>
        <div className="stat">
          <span className="stat-label">Lines</span>
          <span className="stat-value">{gameState.lines}</span>
        </div>
      </div>

      <div className="game-board-container">
        <div className="game-board-mini">
          {displayBoard.map((row, y) => (
            <div key={y} className="board-row-mini">
              {row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`board-cell-mini ${cell ? 'filled' : 'empty'} ${cell === 'ghost' ? 'ghost' : ''}`}
                  style={{
                    backgroundColor: cell ? PIECE_COLORS[cell] : PIECE_COLORS.null,
                    opacity: cell === 'ghost' ? 0.3 : 1
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        
        {gameState.isGameOver && (
          <div className="game-over-overlay">
            <div className="game-over-text">Game Over</div>
          </div>
        )}
        
        {gameState.isPaused && !gameState.isGameOver && (
          <div className="pause-overlay">
            <div className="pause-text">Paused</div>
          </div>
        )}
      </div>
    </div>
  );
}; 
