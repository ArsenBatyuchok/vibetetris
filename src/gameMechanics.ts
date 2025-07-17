import type { TetrisPiece, GameState, PieceType } from './types';
import { POINTS, LINES_PER_LEVEL, INITIAL_DROP_TIME, MIN_DROP_TIME, DROP_TIME_DECREASE } from './constants';
import { isValidPosition, placePieceOnBoard, clearLines, createEmptyBoard } from './gameBoard';
import { createPiece, getRandomPieceType, rotatePiece, PIECE_SHAPES } from './pieces';

export const movePiece = (
  board: (PieceType | null)[][],
  piece: TetrisPiece,
  deltaX: number,
  deltaY: number
): TetrisPiece | null => {
  const newPiece = {
    ...piece,
    position: {
      x: piece.position.x + deltaX,
      y: piece.position.y + deltaY
    }
  };
  
  return isValidPosition(board, newPiece) ? newPiece : null;
};

export const tryRotatePiece = (
  board: (PieceType | null)[][],
  piece: TetrisPiece
): TetrisPiece | null => {
  const rotatedPiece = rotatePiece(piece);
  
  // Try basic rotation
  if (isValidPosition(board, rotatedPiece)) {
    return rotatedPiece;
  }
  
  // Try wall kicks (SRS - Super Rotation System simplified)
  const wallKicks = [
    { x: -1, y: 0 }, // Left
    { x: 1, y: 0 },  // Right
    { x: 0, y: -1 }, // Up
    { x: -1, y: -1 }, // Left + Up
    { x: 1, y: -1 }   // Right + Up
  ];
  
  for (const kick of wallKicks) {
    const kickedPiece = {
      ...rotatedPiece,
      position: {
        x: rotatedPiece.position.x + kick.x,
        y: rotatedPiece.position.y + kick.y
      }
    };
    
    if (isValidPosition(board, kickedPiece)) {
      return kickedPiece;
    }
  }
  
  return null; // Rotation not possible
};

export const dropPiece = (
  board: (PieceType | null)[][],
  piece: TetrisPiece
): { piece: TetrisPiece, distance: number } => {
  let droppedPiece = piece;
  let distance = 0;
  
  while (true) {
    const nextPiece = movePiece(board, droppedPiece, 0, 1);
    if (nextPiece) {
      droppedPiece = nextPiece;
      distance++;
    } else {
      break;
    }
  }
  
  return { piece: droppedPiece, distance };
};

export const calculateScore = (linesCleared: number, level: number, isSoftDrop: boolean = false, hardDropDistance: number = 0): number => {
  let points = 0;
  
  // Line clear points
  switch (linesCleared) {
    case 1:
      points += POINTS.SINGLE * (level + 1);
      break;
    case 2:
      points += POINTS.DOUBLE * (level + 1);
      break;
    case 3:
      points += POINTS.TRIPLE * (level + 1);
      break;
    case 4:
      points += POINTS.TETRIS * (level + 1);
      break;
  }
  
  // Soft drop points
  if (isSoftDrop) {
    points += POINTS.SOFT_DROP;
  }
  
  // Hard drop points
  points += hardDropDistance * POINTS.HARD_DROP;
  
  return points;
};

export const getLevel = (lines: number): number => {
  return Math.floor(lines / LINES_PER_LEVEL);
};

export const getDropTime = (level: number): number => {
  const dropTime = INITIAL_DROP_TIME - (level * DROP_TIME_DECREASE);
  return Math.max(dropTime, MIN_DROP_TIME);
};

export const isGameOver = (board: (PieceType | null)[][], piece: TetrisPiece): boolean => {
  // Check if the new piece can be placed at spawn position
  return !isValidPosition(board, piece);
};

export const createInitialGameState = (): GameState => {
  const board = createEmptyBoard();
  const firstPieceType = getRandomPieceType();
  const secondPieceType = getRandomPieceType();
  
  return {
    board,
    currentPiece: createPiece(firstPieceType),
    nextPiece: createPiece(secondPieceType),
    score: 0,
    level: 0,
    lines: 0,
    isGameOver: false,
    isPaused: false,
    isPlaying: false
  };
};

export const spawnNextPiece = (gameState: GameState): GameState => {
  if (!gameState.nextPiece) {
    return gameState;
  }
  
  const newPieceType = getRandomPieceType();
  const newCurrentPiece = createPiece(gameState.nextPiece.type);
  const newNextPiece = createPiece(newPieceType);
  
  // Check if game is over
  if (isGameOver(gameState.board, newCurrentPiece)) {
    return {
      ...gameState,
      currentPiece: newCurrentPiece,
      nextPiece: newNextPiece,
      isGameOver: true
    };
  }
  
  return {
    ...gameState,
    currentPiece: newCurrentPiece,
    nextPiece: newNextPiece
  };
};

export const lockPieceAndClearLines = (gameState: GameState): GameState => {
  if (!gameState.currentPiece) return gameState;
  
  // Place piece on board
  const boardWithPiece = placePieceOnBoard(gameState.board, gameState.currentPiece);
  
  // Clear completed lines
  const { newBoard, linesCleared } = clearLines(boardWithPiece);
  
  // Calculate new stats
  const newLines = gameState.lines + linesCleared;
  const newLevel = getLevel(newLines);
  const newScore = gameState.score + calculateScore(linesCleared, gameState.level);
  
  // Create new game state with updated board and stats
  const newGameState: GameState = {
    ...gameState,
    board: newBoard,
    currentPiece: null,
    score: newScore,
    level: newLevel,
    lines: newLines
  };
  
  // Spawn next piece
  return spawnNextPiece(newGameState);
}; 
