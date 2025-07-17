import { PIECE_COLORS } from '../constants';

// Function to darken a hex color for shadow effect
export const darkenColor = (hex: string, amount: number = 0.3): string => {
  // Remove # if present
  const color = hex.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Darken each component
  const newR = Math.max(0, Math.floor(r * (1 - amount)));
  const newG = Math.max(0, Math.floor(g * (1 - amount)));
  const newB = Math.max(0, Math.floor(b * (1 - amount)));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Get shadow color for a piece type
export const getShadowColor = (pieceType: string): string => {
  const baseColor = PIECE_COLORS[pieceType];
  if (!baseColor || baseColor === '#000000') return 'rgba(0, 0, 0, 0.3)';
  
  const darkened = darkenColor(baseColor, 0.4);
  return `${darkened}80`; // Add 50% opacity
};

// Get inset shadow style for a piece
export const getInsetShadowStyle = (pieceType: string): string => {
  if (!pieceType || pieceType === 'ghost') return 'none';
  
  const shadowColor = getShadowColor(pieceType);
  return `inset 0 0 8px ${shadowColor}, inset 0 0 2px ${shadowColor}`;
}; 
