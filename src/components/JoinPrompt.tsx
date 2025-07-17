import React, { useState } from 'react';

interface JoinPromptProps {
  onJoin: (username: string, emoji: string) => void;
}

const EMOJIS = ['😊', '😎', '🤖', '🦄', '🔥', '⚡', '🌟', '🎮', '🎯', '🚀', '💎', '🌈', '👑', '🐱', '🐶', '🐸', '🦊', '🐨'];

export const JoinPrompt: React.FC<JoinPromptProps> = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim(), selectedEmoji);
    }
  };

  const generateRandomUsername = () => {
    const adjectives = ['Cool', 'Super', 'Mega', 'Epic', 'Fire', 'Swift', 'Smart', 'Bold', 'Quick', 'Brave'];
    const nouns = ['Player', 'Gamer', 'Hero', 'Star', 'Ace', 'Pro', 'Legend', 'Master', 'Ninja', 'Wizard'];
    const randomUsername = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${Math.floor(Math.random() * 100)}`;
    setUsername(randomUsername);
  };

  return (
    <div className="join-prompt">
      <h2>Join Multiplayer Tetris</h2>
      <form onSubmit={handleSubmit} className="join-form">
        <div>
          <label htmlFor="username">Choose your username:</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="username-input"
              maxLength={20}
              required
            />
            <button 
              type="button" 
              onClick={generateRandomUsername}
              style={{ 
                padding: '8px 12px', 
                fontSize: '12px',
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Random
            </button>
          </div>
        </div>

        <div>
          <label>Choose your emoji:</label>
          <div className="emoji-selector">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`emoji-option ${selectedEmoji === emoji ? 'selected' : ''}`}
                onClick={() => setSelectedEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <button 
          type="submit" 
          className="join-button"
          disabled={!username.trim()}
        >
          Join Game
        </button>
      </form>
    </div>
  );
}; 
