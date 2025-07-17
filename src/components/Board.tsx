import React from 'react';
import type { TetrisPiece, CellType } from '../types';
import { PIECE_COLORS } from '../constants';
import { placePieceOnBoard, getBoardWithGhost, getGhostPiecePosition } from '../gameBoard';
import { getInsetShadowStyle } from '../utils/colorUtils';

interface BoardProps {
  board: (CellType)[][];
  currentPiece: TetrisPiece | null;
}

export const Board: React.FC<BoardProps> = ({ board, currentPiece }) => {
  // Create display board with current piece and ghost piece
  let displayBoard: (CellType)[][] = [...board.map(row => [...row])];
  
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
                backgroundColor: cell === 'ghost' ? 
                  (currentPiece ? PIECE_COLORS[currentPiece.type] : PIECE_COLORS.null) : 
                  (cell ? PIECE_COLORS[cell] : PIECE_COLORS.null),
                opacity: cell === 'ghost' ? 0.3 : 1,
                boxShadow: cell && cell !== 'ghost' ? getInsetShadowStyle(cell) : 'none'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}; 
