import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared/types': path.resolve(__dirname, '../shared/types.ts')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  optimizeDeps: {
    exclude: ['@shared/types']
  },
  server: {
    port: 3000,
    host: true, // Allow external access
    allowedHosts: [
      'localhost',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok.app'
    ],
    proxy: {
      // Proxy all /socket.io requests to backend
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying
        rewrite: (path) => path
      },
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
