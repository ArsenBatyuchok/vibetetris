export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const PIECE_COLORS: Record<string, string> = {
  I: '#00f0f0', // Cyan
  O: '#f0f000', // Yellow  
  T: '#a000f0', // Purple
  S: '#00f000', // Green
  Z: '#f00000', // Red
  J: '#0000f0', // Blue
  L: '#f0a000', // Orange
  null: '#000000', // Black (empty)
  ghost: '#333333' // Dark gray for ghost piece
};

export const INITIAL_DROP_TIME = 1000; // milliseconds
export const MIN_DROP_TIME = 50;
export const DROP_TIME_DECREASE = 50;

export const POINTS = {
  SINGLE: 40,
  DOUBLE: 100,
  TRIPLE: 300,
  TETRIS: 1200,
  SOFT_DROP: 1,
  HARD_DROP: 2
};

export const LINES_PER_LEVEL = 10;

// Key codes for controls
export const KEYS = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight', 
  DOWN: 'ArrowDown',
  UP: 'ArrowUp', // Unused
  SPACE: ' ', // Rotate
  TAB: 'Tab', // Hard drop
  ESCAPE: 'Escape', // Pause
  ENTER: 'Enter' // Start/Restart
} as const; 
