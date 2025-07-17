import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import type { Socket } from 'socket.io-client';

interface StreamState {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  peers: Record<string, Peer.Instance>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
}

export const useWebRTC = (socket: Socket | null, myPlayerId: string | null) => {
  const [streamState, setStreamState] = useState<StreamState>({
    localStream: null,
    remoteStreams: {},
    peers: {},
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Record<string, Peer.Instance>>({});

  // Initialize local media stream
  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setStreamState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      return null;
    }
  }, []);

  // Create peer connection
  const createPeer = useCallback((targetPlayerId: string, initiator: boolean, stream: MediaStream) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream
    });

    peer.on('signal', (data) => {
      if (socket) {
        socket.emit('webrtc-signal', {
          targetPlayerId,
          signal: data,
          fromPlayerId: myPlayerId
        });
      }
    });

    peer.on('stream', (remoteStream) => {
      setStreamState(prev => ({
        ...prev,
        remoteStreams: {
          ...prev.remoteStreams,
          [targetPlayerId]: remoteStream
        }
      }));
    });

    peer.on('error', (error) => {
      console.error('Peer error:', error);
    });

    peer.on('close', () => {
      setStreamState(prev => {
        const newRemoteStreams = { ...prev.remoteStreams };
        delete newRemoteStreams[targetPlayerId];
        
        const newPeers = { ...prev.peers };
        delete newPeers[targetPlayerId];
        
        return {
          ...prev,
          remoteStreams: newRemoteStreams,
          peers: newPeers
        };
      });
    });

    peersRef.current[targetPlayerId] = peer;
    setStreamState(prev => ({ ...prev, peers: { ...prev.peers, [targetPlayerId]: peer } }));

    return peer;
  }, [socket, myPlayerId]);

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    const handleWebRTCSignal = ({ fromPlayerId, signal, targetPlayerId }: any) => {
      if (targetPlayerId !== myPlayerId) return;

      const peer = peersRef.current[fromPlayerId];
      if (peer) {
        peer.signal(signal);
      }
    };

    const handlePlayerJoined = async ({ playerId }: { playerId: string }) => {
      if (playerId === myPlayerId || !streamState.localStream) return;

      // Create peer as initiator for new players
      createPeer(playerId, true, streamState.localStream);
    };

    const handlePlayerLeft = ({ playerId }: { playerId: string }) => {
      const peer = peersRef.current[playerId];
      if (peer) {
        peer.destroy();
        delete peersRef.current[playerId];
      }

      setStreamState(prev => {
        const newRemoteStreams = { ...prev.remoteStreams };
        delete newRemoteStreams[playerId];
        
        const newPeers = { ...prev.peers };
        delete newPeers[playerId];
        
        return {
          ...prev,
          remoteStreams: newRemoteStreams,
          peers: newPeers
        };
      });
    };

    const handleCallUser = async ({ fromPlayerId }: { fromPlayerId: string }) => {
      if (!streamState.localStream) return;

      // Create peer as receiver
      createPeer(fromPlayerId, false, streamState.localStream);
    };

    socket.on('webrtc-signal', handleWebRTCSignal);
    socket.on('player-joined-call', handlePlayerJoined);
    socket.on('player-left-call', handlePlayerLeft);
    socket.on('incoming-call', handleCallUser);

    return () => {
      socket.off('webrtc-signal', handleWebRTCSignal);
      socket.off('player-joined-call', handlePlayerJoined);
      socket.off('player-left-call', handlePlayerLeft);
      socket.off('incoming-call', handleCallUser);
    };
  }, [socket, myPlayerId, streamState.localStream, createPeer]);

  // Join video call
  const joinCall = useCallback(async () => {
    const stream = await initializeMedia();
    if (stream && socket) {
      socket.emit('join-video-call', { playerId: myPlayerId });
    }
  }, [initializeMedia, socket, myPlayerId]);

  // Leave video call
  const leaveCall = useCallback(() => {
    // Stop local stream
    if (streamState.localStream) {
      streamState.localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    Object.values(peersRef.current).forEach(peer => peer.destroy());
    peersRef.current = {};

    setStreamState({
      localStream: null,
      remoteStreams: {},
      peers: {},
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false
    });

    if (socket) {
      socket.emit('leave-video-call', { playerId: myPlayerId });
    }
  }, [streamState.localStream, socket, myPlayerId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (streamState.localStream) {
      const videoTrack = streamState.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !streamState.isVideoEnabled;
        setStreamState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
      }
    }
  }, [streamState.localStream, streamState.isVideoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (streamState.localStream) {
      const audioTrack = streamState.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !streamState.isAudioEnabled;
        setStreamState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
      }
    }
  }, [streamState.localStream, streamState.isAudioEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamState.localStream) {
        streamState.localStream.getTracks().forEach(track => track.stop());
      }
      Object.values(peersRef.current).forEach(peer => peer.destroy());
    };
  }, []);

  return {
    ...streamState,
    localVideoRef,
    joinCall,
    leaveCall,
    toggleVideo,
    toggleAudio
  };
}; 
