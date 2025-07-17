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
  isInCall: boolean;
}

export const useWebRTC = (socket: Socket | null, myPlayerId: string | null) => {
  const [streamState, setStreamState] = useState<StreamState>({
    localStream: null,
    remoteStreams: {},
    peers: {},
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isInCall: false
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
    // Don't create duplicate peers
    if (peersRef.current[targetPlayerId]) {
      console.log(`Peer already exists for ${targetPlayerId}`);
      return peersRef.current[targetPlayerId];
    }

    console.log(`Creating peer for ${targetPlayerId}, initiator: ${initiator}`);

    try {
      const peer = new Peer({
        initiator,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      peer.on('signal', (data) => {
        console.log(`Sending signal to ${targetPlayerId}:`, data.type);
        if (socket) {
          socket.emit('webrtc-signal', {
            targetPlayerId,
            signal: data,
            fromPlayerId: myPlayerId
          });
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log(`Received stream from ${targetPlayerId}`);
        setStreamState(prev => ({
          ...prev,
          remoteStreams: {
            ...prev.remoteStreams,
            [targetPlayerId]: remoteStream
          }
        }));
      });

      peer.on('connect', () => {
        console.log(`Peer connected to ${targetPlayerId}`);
      });

      peer.on('error', (error) => {
        console.error(`Peer error for ${targetPlayerId}:`, error);
        // Clean up on error
        if (peersRef.current[targetPlayerId]) {
          delete peersRef.current[targetPlayerId];
        }
      });

      peer.on('close', () => {
        console.log(`Peer closed for ${targetPlayerId}`);
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
    } catch (error) {
      console.error('Failed to create peer:', error);
      return null;
    }
  }, [socket, myPlayerId]);

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket) return;

    const handleWebRTCSignal = ({ fromPlayerId, signal, targetPlayerId }: any) => {
      if (targetPlayerId !== myPlayerId) return;

      console.log(`Received signal from ${fromPlayerId}:`, signal.type);
      const peer = peersRef.current[fromPlayerId];
      if (peer) {
        try {
          peer.signal(signal);
        } catch (error) {
          console.error('Error signaling peer:', error);
        }
      } else {
        console.warn(`No peer found for ${fromPlayerId} when receiving signal`);
      }
    };

    const handlePlayerJoined = async ({ playerId }: { playerId: string }) => {
      if (playerId === myPlayerId || !streamState.isInCall || !streamState.localStream) return;
      
      console.log(`Player ${playerId} joined call`);
      
      // Only create peer if we are the initiator (lower playerId initiates)
      if (myPlayerId && myPlayerId < playerId) {
        createPeer(playerId, true, streamState.localStream);
      }
    };

    const handlePlayerLeft = ({ playerId }: { playerId: string }) => {
      console.log(`Player ${playerId} left call`);
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

    const handleIncomingCall = ({ fromPlayerId }: { fromPlayerId: string }) => {
      if (!streamState.isInCall || !streamState.localStream) return;
      
      console.log(`Incoming call from ${fromPlayerId}`);
      
      // Only create peer if we are not the initiator (higher playerId receives)
      if (myPlayerId && myPlayerId > fromPlayerId) {
        createPeer(fromPlayerId, false, streamState.localStream);
      }
    };

    socket.on('webrtc-signal', handleWebRTCSignal);
    socket.on('player-joined-call', handlePlayerJoined);
    socket.on('player-left-call', handlePlayerLeft);
    socket.on('incoming-call', handleIncomingCall);

    return () => {
      socket.off('webrtc-signal', handleWebRTCSignal);
      socket.off('player-joined-call', handlePlayerJoined);
      socket.off('player-left-call', handlePlayerLeft);
      socket.off('incoming-call', handleIncomingCall);
    };
  }, [socket, myPlayerId, streamState.localStream, streamState.isInCall, createPeer]);

  // Join video call
  const joinCall = useCallback(async () => {
    console.log('Joining video call...');
    const stream = await initializeMedia();
    if (stream && socket && myPlayerId) {
      setStreamState(prev => ({ ...prev, isInCall: true }));
      socket.emit('join-video-call', { playerId: myPlayerId });
    }
  }, [initializeMedia, socket, myPlayerId]);

  // Leave video call
  const leaveCall = useCallback(() => {
    console.log('Leaving video call...');
    
    // Stop local stream
    if (streamState.localStream) {
      streamState.localStream.getTracks().forEach(track => track.stop());
    }

    // Close all peer connections
    Object.values(peersRef.current).forEach(peer => {
      try {
        peer.destroy();
      } catch (error) {
        console.error('Error destroying peer:', error);
      }
    });
    peersRef.current = {};

    setStreamState({
      localStream: null,
      remoteStreams: {},
      peers: {},
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      isInCall: false
    });

    if (socket && myPlayerId) {
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
      Object.values(peersRef.current).forEach(peer => {
        try {
          peer.destroy();
        } catch (error) {
          console.error('Error destroying peer on cleanup:', error);
        }
      });
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
