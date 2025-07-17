import { BOARD_WIDTH, BOARD_HEIGHT } from './constants';
import type { PieceType, TetrisPiece } from './types';

export const createEmptyBoard = (): (PieceType | null)[][] => {
  return Array.from({ length: BOARD_HEIGHT }, () => 
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
};

export const isValidPosition = (
  board: (PieceType | null)[][],
  piece: TetrisPiece,
  offsetX: number = 0,
  offsetY: number = 0
): boolean => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.position.x + x + offsetX;
        const newY = piece.position.y + y + offsetY;
        
        // Check bounds
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        
        // Check collision with existing pieces (but allow negative Y for spawning)
        if (newY >= 0 && board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
};

export const placePieceOnBoard = (
  board: (PieceType | null)[][],
  piece: TetrisPiece
): (PieceType | null)[][] => {
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardX = piece.position.x + x;
        const boardY = piece.position.y + y;
        
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = piece.type;
        }
      }
    }
  }
  
  return newBoard;
};

export const clearLines = (board: (PieceType | null)[][]): { 
  newBoard: (PieceType | null)[][], 
  linesCleared: number 
} => {
  const newBoard: (PieceType | null)[][] = [];
  let linesCleared = 0;
  
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    const isLineFull = board[y].every(cell => cell !== null);
    
    if (!isLineFull) {
      newBoard.unshift(board[y]);
    } else {
      linesCleared++;
    }
  }
  
  // Add empty lines at the top
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null));
  }
  
  return { newBoard, linesCleared };
};

export const getGhostPiecePosition = (
  board: (PieceType | null)[][],
  piece: TetrisPiece
): number => {
  let ghostY = piece.position.y;
  
  while (isValidPosition(board, { ...piece, position: { ...piece.position, y: ghostY + 1 } })) {
    ghostY++;
  }
  
  return ghostY;
};

export const getBoardWithGhost = (
  board: (PieceType | null)[][],
  piece: TetrisPiece | null,
  currentPiece: TetrisPiece | null
): (PieceType | null)[][] => {
  if (!piece || !currentPiece) return board;
  
  const ghostY = getGhostPiecePosition(board, piece);
  const ghostPiece = { ...piece, position: { ...piece.position, y: ghostY } };
  
  // Don't show ghost if it's at the same position as current piece
  if (ghostPiece.position.y === currentPiece.position.y) {
    return board;
  }
  
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < ghostPiece.shape.length; y++) {
    for (let x = 0; x < ghostPiece.shape[y].length; x++) {
      if (ghostPiece.shape[y][x]) {
        const boardX = ghostPiece.position.x + x;
        const boardY = ghostPiece.position.y + y;
        
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          if (!newBoard[boardY][boardX]) {
            newBoard[boardY][boardX] = 'ghost' as PieceType;
          }
        }
      }
    }
  }
  
  return newBoard;
}; 
