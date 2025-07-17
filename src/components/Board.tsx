import React from 'react';
import type { PieceType, TetrisPiece } from '../types';
import { PIECE_COLORS } from '../constants';
import { placePieceOnBoard, getBoardWithGhost } from '../gameBoard';

interface BoardProps {
  board: (PieceType | null)[][];
  currentPiece: TetrisPiece | null;
}

export const Board: React.FC<BoardProps> = ({ board, currentPiece }) => {
  // Create display board with current piece and ghost piece
  let displayBoard = [...board.map(row => [...row])];
  
  // Add ghost piece
  if (currentPiece) {
    displayBoard = getBoardWithGhost(displayBoard, currentPiece, currentPiece);
  }
  
  // Add current piece
  if (currentPiece) {
    displayBoard = placePieceOnBoard(displayBoard, currentPiece);
  }

  return (
    <div className="game-board">
      {displayBoard.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`board-cell ${cell ? 'filled' : 'empty'} ${cell === 'ghost' ? 'ghost' : ''}`}
              style={{
                backgroundColor: cell ? PIECE_COLORS[cell] : PIECE_COLORS.null,
                opacity: cell === 'ghost' ? 0.3 : 1
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}; 
