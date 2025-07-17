import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Player, MultiplayerState, GameState, GameAction } from '../types';
import { createInitialGameState } from '../gameMechanics';

export const useMultiplayer = () => {
  const [multiplayerState, setMultiplayerState] = useState<MultiplayerState>({
    players: {},
    isConnected: false,
    myPlayerId: null
  });
  
  const [showJoinPrompt, setShowJoinPrompt] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current) return;

    // Dynamically determine WebSocket server URL based on current host
    const getServerUrl = () => {
      if (import.meta.env.VITE_SERVER_URL) {
        return import.meta.env.VITE_SERVER_URL;
      }
      
      // Use the same host as the current page, but port 3001
      const currentHost = window.location.hostname;
      return `http://${currentHost}:3001`;
    };

    const socket = io(getServerUrl());
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setMultiplayerState(prev => ({
        ...prev,
        isConnected: true,
        myPlayerId: socket.id
      }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setMultiplayerState(prev => ({
        ...prev,
        isConnected: false,
        myPlayerId: null
      }));
    });

    socket.on('players-update', (players: Record<string, Player>) => {
      setMultiplayerState(prev => ({
        ...prev,
        players
      }));
    });

    socket.on('player-state-update', ({ playerId, gameState }: { playerId: string; gameState: GameState }) => {
      setMultiplayerState(prev => ({
        ...prev,
        players: {
          ...prev.players,
          [playerId]: {
            ...prev.players[playerId],
            gameState
          }
        }
      }));
    });

    return socket;
  }, []);

  const joinGame = useCallback((username: string, emoji: string) => {
    const socket = connect();
    if (socket) {
      socket.emit('join-game', { username, emoji });
      setShowJoinPrompt(false);
    }
  }, [connect]);

  const updateGameState = useCallback((gameState: GameState) => {
    if (socketRef.current && multiplayerState.isConnected) {
      socketRef.current.emit('game-state-update', gameState);
      
      // Update local state
      if (multiplayerState.myPlayerId) {
        setMultiplayerState(prev => ({
          ...prev,
          players: {
            ...prev.players,
            [multiplayerState.myPlayerId!]: {
              ...prev.players[multiplayerState.myPlayerId!],
              gameState
            }
          }
        }));
      }
    }
  }, [multiplayerState.isConnected, multiplayerState.myPlayerId]);

  const sendGameAction = useCallback((action: GameAction) => {
    if (socketRef.current && multiplayerState.isConnected) {
      socketRef.current.emit('game-action', action);
    }
  }, [multiplayerState.isConnected]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setMultiplayerState({
      players: {},
      isConnected: false,
      myPlayerId: null
    });
    setShowJoinPrompt(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    multiplayerState,
    showJoinPrompt,
    joinGame,
    updateGameState,
    sendGameAction,
    disconnect,
    connect
  };
}; 
