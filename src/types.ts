export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface TetrisPiece {
  type: PieceType;
  shape: number[][];
  position: Position;
  rotation: number;
}

export interface GameState {
  board: (PieceType | null)[][];
  currentPiece: TetrisPiece | null;
  nextPiece: TetrisPiece | null;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
  isPlaying: boolean;
}

export interface GameStats {
  score: number;
  level: number;
  lines: number;
}

export interface Player {
  id: string;
  username: string;
  emoji: string;
  gameState: GameState;
  isConnected: boolean;
}

export interface MultiplayerState {
  players: Record<string, Player>;
  isConnected: boolean;
  myPlayerId: string | null;
}

export type GameAction = 
  | { type: 'MOVE_LEFT' }
  | { type: 'MOVE_RIGHT' }
  | { type: 'MOVE_DOWN' }
  | { type: 'ROTATE' }
  | { type: 'DROP' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART' }
  | { type: 'START' };

export type MultiplayerAction = 
  | { type: 'PLAYER_JOINED'; payload: Player }
  | { type: 'PLAYER_LEFT'; payload: string }
  | { type: 'GAME_STATE_UPDATE'; payload: { playerId: string; gameState: GameState } }
  | { type: 'PLAYERS_LIST'; payload: Record<string, Player> }; 
