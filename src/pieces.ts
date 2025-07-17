import type { PieceType, TetrisPiece, Position } from './types';

// Define all piece shapes for each rotation (0, 90, 180, 270 degrees)
export const PIECE_SHAPES: Record<PieceType, number[][][]> = {
  I: [
    // 0°
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    // 90°
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0]
    ],
    // 180°
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0]
    ],
    // 270°
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0]
    ]
  ],
  
  O: [
    // Same for all rotations
    [
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 1]
    ],
    [
      [1, 1],
      [1, 1]
    ]
  ],
  
  T: [
    // 0°
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    // 90°
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0]
    ],
    // 180°
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0]
    ],
    // 270°
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]
  ],
  
  S: [
    // 0°
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    // 90°
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1]
    ],
    // 180°
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0]
    ],
    // 270°
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0]
    ]
  ],
  
  Z: [
    // 0°
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    // 90°
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0]
    ],
    // 180°
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1]
    ],
    // 270°
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0]
    ]
  ],
  
  J: [
    // 0°
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    // 90°
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0]
    ],
    // 180°
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1]
    ],
    // 270°
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0]
    ]
  ],
  
  L: [
    // 0°
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    // 90°
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1]
    ],
    // 180°
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0]
    ],
    // 270°
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0]
    ]
  ]
};

export const createPiece = (type: PieceType, position: Position = { x: 3, y: 0 }): TetrisPiece => {
  return {
    type,
    shape: PIECE_SHAPES[type][0], // Start with rotation 0
    position,
    rotation: 0
  };
};

export const getRandomPieceType = (): PieceType => {
  const pieces: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return pieces[Math.floor(Math.random() * pieces.length)];
};

export const rotatePiece = (piece: TetrisPiece): TetrisPiece => {
  const newRotation = (piece.rotation + 1) % 4;
  return {
    ...piece,
    rotation: newRotation,
    shape: PIECE_SHAPES[piece.type][newRotation]
  };
}; 
