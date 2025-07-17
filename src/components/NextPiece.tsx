import React from 'react';
import type { TetrisPiece } from '../types';
import { PIECE_COLORS } from '../constants';
import { getInsetShadowStyle } from '../utils/colorUtils';

interface NextPieceProps {
  nextPiece: TetrisPiece | null;
}

export const NextPiece: React.FC<NextPieceProps> = ({ nextPiece }) => {
  if (!nextPiece) {
    return <div className="next-piece-container">No piece</div>;
  }

  return (
    <div className="next-piece-container">
      <h3>Next</h3>
      <div className="next-piece-grid">
        {nextPiece.shape.map((row, y) => (
          <div key={y} className="next-piece-row">
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`next-piece-cell ${cell ? 'filled' : 'empty'}`}
                style={{
                  backgroundColor: cell ? PIECE_COLORS[nextPiece.type] : 'transparent',
                  boxShadow: cell ? getInsetShadowStyle(nextPiece.type) : 'none'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}; 
