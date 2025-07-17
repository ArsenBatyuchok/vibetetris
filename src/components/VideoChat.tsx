import React from 'react';
import { PlayerVideo } from './PlayerVideo';
import type { Player } from '../types';

interface VideoChatProps {
  players: Record<string, Player>;
  myPlayerId: string | null;
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onJoinCall: () => void;
  onLeaveCall: () => void;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  isInCall: boolean;
}

export const VideoChat: React.FC<VideoChatProps> = ({
  players,
  myPlayerId,
  localStream,
  remoteStreams,
  localVideoRef,
  isVideoEnabled,
  isAudioEnabled,
  onJoinCall,
  onLeaveCall,
  onToggleVideo,
  onToggleAudio,
  isInCall
}) => {
  const currentPlayer = myPlayerId ? players[myPlayerId] : null;
  const otherPlayers = Object.values(players).filter(p => p.id !== myPlayerId);

  return (
    <div className="video-chat">
      {/* Video Controls */}
      <div className="video-controls">
        {!isInCall ? (
          <button onClick={onJoinCall} className="video-control-btn join-call">
            📹 Join Video Call
          </button>
        ) : (
          <>
            <button onClick={onLeaveCall} className="video-control-btn leave-call">
              ❌ Leave Call
            </button>
            <button 
              onClick={onToggleVideo} 
              className={`video-control-btn ${isVideoEnabled ? 'enabled' : 'disabled'}`}
            >
              {isVideoEnabled ? '📹' : '📷'} Video
            </button>
            <button 
              onClick={onToggleAudio} 
              className={`video-control-btn ${isAudioEnabled ? 'enabled' : 'disabled'}`}
            >
              {isAudioEnabled ? '🎤' : '🔇'} Audio
            </button>
          </>
        )}
      </div>

      {/* Video Streams */}
      {isInCall && (
        <div className="video-streams">
          {/* Local Video */}
          {currentPlayer && (
            <PlayerVideo
              player={currentPlayer}
              stream={localStream}
              isLocal={true}
            />
          )}

          {/* Remote Videos */}
          {otherPlayers.map(player => (
            <PlayerVideo
              key={player.id}
              player={player}
              stream={remoteStreams[player.id] || null}
              isLocal={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 
