import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Make Vite less aggressive
  build: {
    // Disable minification for easier debugging
    minify: false,
    
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Less aggressive tree shaking
    rollupOptions: {
      output: {
        // Keep original file names
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    
    // Disable source maps for production (faster builds)
    sourcemap: false
  },
  
  // Less aggressive HMR
  server: {
    hmr: {
      // Reduce HMR update frequency
      overlay: false // Disable error overlay
    }
  },
  
  // Disable aggressive optimizations
  optimizeDeps: {
    // Force include all dependencies to avoid aggressive optimization
    include: ['react', 'react-dom', 'socket.io-client']
  },
  
  // Less aggressive TypeScript checking
  esbuild: {
    // Don't drop console logs
    drop: [],
    // Disable some optimizations
    treeShaking: false
  }
})
