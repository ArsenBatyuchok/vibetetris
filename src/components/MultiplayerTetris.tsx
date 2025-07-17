import React, { useEffect } from 'react';
import { useGame } from '../useGame';
import { useInput } from '../useInput';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useWebRTC } from '../hooks/useWebRTC';
import { PlayerGame } from './PlayerGame';
import { JoinPrompt } from './JoinPrompt';
import { VideoChat } from './VideoChat';

export const MultiplayerTetris: React.FC = () => {
  const { gameState, dispatch, actions } = useGame();
  const { 
    multiplayerState, 
    showJoinPrompt, 
    joinGame, 
    updateGameState, 
    disconnect,
    socket
  } = useMultiplayer();

  // WebRTC for video/audio
  const {
    localStream,
    remoteStreams,
    localVideoRef,
    isVideoEnabled,
    isAudioEnabled,
    isInCall,
    joinCall,
    leaveCall,
    toggleVideo,
    toggleAudio
  } = useWebRTC(socket, multiplayerState.myPlayerId);

  // Set up input handling for the current player
  useInput({
    onAction: dispatch,
    isPlaying: gameState.isPlaying,
    isPaused: gameState.isPaused,
    isGameOver: gameState.isGameOver
  });

  // Sync local game state with multiplayer
  useEffect(() => {
    updateGameState(gameState);
  }, [gameState, updateGameState]);

  const currentPlayer = multiplayerState.myPlayerId ? multiplayerState.players[multiplayerState.myPlayerId] : null;
  const otherPlayers = Object.values(multiplayerState.players).filter(
    player => player.id !== multiplayerState.myPlayerId
  );

  const handleQuit = () => {
    disconnect();
    actions.restartGame();
  };

  if (showJoinPrompt) {
    return <JoinPrompt onJoin={joinGame} />;
  }

  return (
    <div className="multiplayer-container">
      {/* Connection Status */}
      <div className={`connection-status ${multiplayerState.isConnected ? 'connected' : 'disconnected'}`}>
        {multiplayerState.isConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Quit Button */}
      <div className="quit-section">
        <button onClick={handleQuit} className="quit-button">
          ✕ Quit
        </button>
      </div>

      {/* Players Grid */}
      <div className="players-grid">
        {/* Current Player (always first) */}
        {currentPlayer && (
          <PlayerGame 
            key={currentPlayer.id}
            player={{
              ...currentPlayer,
              gameState
            }}
            isCurrentPlayer={true}
          />
        )}
        
        {/* Other Players */}
        {otherPlayers.map((player) => (
          <PlayerGame 
            key={player.id}
            player={player}
            isCurrentPlayer={false}
          />
        ))}
      </div>

      {/* Video Chat Section */}
      <VideoChat
        players={multiplayerState.players}
        myPlayerId={multiplayerState.myPlayerId}
        localStream={localStream}
        remoteStreams={remoteStreams}
        localVideoRef={localVideoRef}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onJoinCall={joinCall}
        onLeaveCall={leaveCall}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        isInCall={isInCall}
      />

      {/* Controls Panel */}
      <div className="controls-panel">
        {!gameState.isPlaying || gameState.isGameOver ? (
          <button onClick={actions.startGame} className="control-button-mini start">
            {gameState.isGameOver ? 'Restart' : 'Start Game'}
          </button>
        ) : (
          <button onClick={actions.pauseGame} className="control-button-mini pause">
            {gameState.isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        {(gameState.isPlaying || gameState.isGameOver) && (
          <button onClick={actions.restartGame} className="control-button-mini restart">
            New Game
          </button>
        )}

        <div className="controls-info">
          <strong>Controls:</strong> ←/→ Move • ↓ Soft Drop • Space Rotate • Tab Hard Drop • Esc Pause
        </div>
      </div>
    </div>
  );
}; 
