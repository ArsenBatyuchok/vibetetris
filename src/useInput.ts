import { useEffect, useRef } from 'react';
import { KEYS } from './constants';
import type { GameAction } from './types';

interface UseInputProps {
  onAction: (action: GameAction) => void;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
}

export const useInput = ({ onAction, isPlaying, isPaused, isGameOver }: UseInputProps) => {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const lastMoveTimeRef = useRef<{ [key: string]: number }>({});
  const repeatIntervalRef = useRef<{ [key: string]: number }>({});

  const INITIAL_DELAY = 200; // Initial delay before repeat starts (ms)
  const REPEAT_DELAY = 50;   // Delay between repeats (ms)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Prevent default for game keys
      if (Object.values(KEYS).includes(key as any)) {
        event.preventDefault();
      }
      
      // Special handling for Tab key
      if (key === KEYS.TAB) {
        event.preventDefault();
      }

      // Handle non-repeating keys immediately
      if (key === KEYS.SPACE || key === KEYS.TAB || key === KEYS.ESCAPE || key === KEYS.ENTER) {
        handleSingleAction(key);
        return;
      }

      // Handle repeating keys (left, right, down)
      if (!pressedKeysRef.current.has(key)) {
        pressedKeysRef.current.add(key);
        
        // Immediate action
        handleRepeatingAction(key);
        
        // Set up repeat after initial delay
        setTimeout(() => {
          if (pressedKeysRef.current.has(key)) {
            repeatIntervalRef.current[key] = window.setInterval(() => {
              if (pressedKeysRef.current.has(key)) {
                handleRepeatingAction(key);
              }
            }, REPEAT_DELAY);
          }
        }, INITIAL_DELAY);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      
      if (pressedKeysRef.current.has(key)) {
        pressedKeysRef.current.delete(key);
        
        // Clear repeat interval
        if (repeatIntervalRef.current[key]) {
          clearInterval(repeatIntervalRef.current[key]);
          delete repeatIntervalRef.current[key];
        }
      }
    };

    const handleSingleAction = (key: string) => {
      switch (key) {
        case KEYS.SPACE:
          if (isPlaying && !isPaused && !isGameOver) {
            onAction({ type: 'ROTATE' });
          }
          break;
        case KEYS.TAB:
          if (isPlaying && !isPaused && !isGameOver) {
            onAction({ type: 'DROP' });
          }
          break;
        case KEYS.ESCAPE:
          if (isPlaying && !isGameOver) {
            onAction({ type: 'PAUSE' });
          }
          break;
        case KEYS.ENTER:
          if (!isPlaying || isGameOver) {
            onAction({ type: 'START' });
          } else if (isPaused) {
            onAction({ type: 'RESUME' });
          }
          break;
      }
    };

    const handleRepeatingAction = (key: string) => {
      if (!isPlaying || isPaused || isGameOver) {
        return;
      }

      switch (key) {
        case KEYS.LEFT:
          onAction({ type: 'MOVE_LEFT' });
          break;
        case KEYS.RIGHT:
          onAction({ type: 'MOVE_RIGHT' });
          break;
        case KEYS.DOWN:
          onAction({ type: 'MOVE_DOWN' });
          break;
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Cleanup function
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      // Clear all intervals
      Object.values(repeatIntervalRef.current).forEach(interval => {
        clearInterval(interval);
      });
      repeatIntervalRef.current = {};
      pressedKeysRef.current.clear();
    };
  }, [onAction, isPlaying, isPaused, isGameOver]);

  // Clean up on state changes
  useEffect(() => {
    if (!isPlaying || isPaused || isGameOver) {
      // Clear all pressed keys and intervals when game state changes
      Object.values(repeatIntervalRef.current).forEach(interval => {
        clearInterval(interval);
      });
      repeatIntervalRef.current = {};
      pressedKeysRef.current.clear();
    }
  }, [isPlaying, isPaused, isGameOver]);
}; 
