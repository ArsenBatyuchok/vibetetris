import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: true, // Allow all origins for development
    methods: ["GET", "POST"],
    credentials: false
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Store game state
const players = new Map();
const gameRooms = new Map();

// Generate random emoji
const emojis = ['😊', '😎', '🤖', '🦄', '🔥', '⚡', '🌟', '🎮', '🎯', '🚀', '💎', '🌈'];
const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];

// Generate random username
const adjectives = ['Cool', 'Super', 'Mega', 'Epic', 'Fire', 'Swift', 'Smart', 'Bold'];
const nouns = ['Player', 'Gamer', 'Hero', 'Star', 'Ace', 'Pro', 'Legend', 'Master'];
const getRandomUsername = () => 
  `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-game', (userData) => {
    const player = {
      id: socket.id,
      username: userData.username || getRandomUsername(),
      emoji: userData.emoji || getRandomEmoji(),
      gameState: {
        board: Array(20).fill(null).map(() => Array(10).fill(null)),
        currentPiece: null,
        nextPiece: null,
        score: 0,
        level: 0,
        lines: 0,
        isGameOver: false,
        isPaused: false,
        isPlaying: false
      },
      isConnected: true
    };

    players.set(socket.id, player);
    
    // Send current players list to all clients
    io.emit('players-update', Object.fromEntries(players));
    
    console.log(`Player joined: ${player.username} (${player.emoji})`);
  });

  socket.on('game-action', (action) => {
    const player = players.get(socket.id);
    if (player) {
      // Broadcast game action to all other clients
      socket.broadcast.emit('player-game-action', {
        playerId: socket.id,
        action
      });
    }
  });

  socket.on('game-state-update', (gameState) => {
    const player = players.get(socket.id);
    if (player) {
      player.gameState = gameState;
      
      // Broadcast updated game state to all other clients
      socket.broadcast.emit('player-state-update', {
        playerId: socket.id,
        gameState
      });
    }
  });

  // WebRTC signaling
  socket.on('webrtc-signal', ({ targetPlayerId, signal, fromPlayerId }) => {
    socket.to(targetPlayerId).emit('webrtc-signal', {
      fromPlayerId,
      signal,
      targetPlayerId
    });
  });

  socket.on('join-video-call', ({ playerId }) => {
    console.log(`Player ${playerId} joined video call`);
    // Notify other players that this player joined the call
    socket.broadcast.emit('player-joined-call', { playerId });
    
    // Tell this player about existing callers
    socket.broadcast.emit('incoming-call', { fromPlayerId: playerId });
  });

  socket.on('leave-video-call', ({ playerId }) => {
    console.log(`Player ${playerId} left video call`);
    socket.broadcast.emit('player-left-call', { playerId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (players.has(socket.id)) {
      const player = players.get(socket.id);
      console.log(`Player left: ${player.username}`);
      players.delete(socket.id);
      
      // Notify about video call leave
      socket.broadcast.emit('player-left-call', { playerId: socket.id });
      
      // Send updated players list to all remaining clients
      io.emit('players-update', Object.fromEntries(players));
    }
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 
