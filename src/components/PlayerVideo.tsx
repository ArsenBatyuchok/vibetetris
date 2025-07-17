import React, { useEffect, useRef } from 'react';
import type { Player } from '../types';

interface PlayerVideoProps {
  player: Player;
  stream: MediaStream | null;
  isLocal?: boolean;
  isMuted?: boolean;
}

export const PlayerVideo: React.FC<PlayerVideoProps> = ({ 
  player, 
  stream, 
  isLocal = false, 
  isMuted = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="player-video">
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || isMuted} // Always mute local video to prevent feedback
          className={`video-stream ${!stream ? 'no-stream' : ''}`}
        />
        
        {!stream && (
          <div className="video-placeholder">
            <span className="player-emoji-large">{player.emoji}</span>
          </div>
        )}
        
        <div className="video-overlay">
          <div className="player-info-video">
            <span className="player-emoji-small">{player.emoji}</span>
            <span className="player-name">{player.username}</span>
          </div>
          
          {isLocal && (
            <div className="local-indicator">
              <span>You</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
