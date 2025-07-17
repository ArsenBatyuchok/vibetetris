import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, GameAction } from './types';
import { createInitialGameState, movePiece, tryRotatePiece, dropPiece, lockPieceAndClearLines, calculateScore, getDropTime } from './gameMechanics';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const dropTimeRef = useRef<number>(0);
  const gameLoopRef = useRef<number | undefined>(undefined);

  // Game actions
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  const restartGame = useCallback(() => {
    setGameState(createInitialGameState());
  }, []);

  const moveLeft = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
      return;
    }

    const newPiece = movePiece(gameState.board, gameState.currentPiece, -1, 0);
    if (newPiece) {
      setGameState(prev => ({
        ...prev,
        currentPiece: newPiece
      }));
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPiece, gameState.board]);

  const moveRight = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
      return;
    }

    const newPiece = movePiece(gameState.board, gameState.currentPiece, 1, 0);
    if (newPiece) {
      setGameState(prev => ({
        ...prev,
        currentPiece: newPiece
      }));
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPiece, gameState.board]);

  const moveDown = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
      return false;
    }

    const newPiece = movePiece(gameState.board, gameState.currentPiece, 0, 1);
    if (newPiece) {
      setGameState(prev => ({
        ...prev,
        currentPiece: newPiece,
        score: prev.score + calculateScore(0, prev.level, true) // Soft drop points
      }));
      return true;
    } else {
      // Piece can't move down, lock it
      setGameState(prev => lockPieceAndClearLines(prev));
      return false;
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPiece, gameState.board, gameState.level]);

  const rotatePiece = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
      return;
    }

    const rotatedPiece = tryRotatePiece(gameState.board, gameState.currentPiece);
    if (rotatedPiece) {
      setGameState(prev => ({
        ...prev,
        currentPiece: rotatedPiece
      }));
    }
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPiece, gameState.board]);

  const hardDrop = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) {
      return;
    }

    const { piece: droppedPiece, distance } = dropPiece(gameState.board, gameState.currentPiece);
    
    setGameState(prev => {
      const newState = {
        ...prev,
        currentPiece: droppedPiece,
        score: prev.score + calculateScore(0, prev.level, false, distance)
      };
      return lockPieceAndClearLines(newState);
    });
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.currentPiece, gameState.board, gameState.level]);

  // Game loop for automatic piece dropping
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isPaused || gameState.isGameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      return;
    }

    const dropTime = getDropTime(gameState.level);
    
    gameLoopRef.current = window.setInterval(() => {
      dropTimeRef.current += 100;
      
      if (dropTimeRef.current >= dropTime) {
        setGameState(prev => {
          if (!prev.currentPiece) return prev;
          
          const newPiece = movePiece(prev.board, prev.currentPiece, 0, 1);
          if (newPiece) {
            return {
              ...prev,
              currentPiece: newPiece
            };
          } else {
            return lockPieceAndClearLines(prev);
          }
        });
        dropTimeRef.current = 0;
      }
    }, 100);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isGameOver, gameState.level]);

  // Dispatch function for handling game actions
  const dispatch = useCallback((action: GameAction) => {
    switch (action.type) {
      case 'START':
        startGame();
        break;
      case 'PAUSE':
        pauseGame();
        break;
      case 'RESUME':
        pauseGame();
        break;
      case 'RESTART':
        restartGame();
        break;
      case 'MOVE_LEFT':
        moveLeft();
        break;
      case 'MOVE_RIGHT':
        moveRight();
        break;
      case 'MOVE_DOWN':
        moveDown();
        break;
      case 'ROTATE':
        rotatePiece();
        break;
      case 'DROP':
        hardDrop();
        break;
    }
  }, [startGame, pauseGame, restartGame, moveLeft, moveRight, moveDown, rotatePiece, hardDrop]);

  return {
    gameState,
    dispatch,
    actions: {
      startGame,
      pauseGame,
      restartGame,
      moveLeft,
      moveRight,
      moveDown,
      rotatePiece,
      hardDrop
    }
  };
}; 
