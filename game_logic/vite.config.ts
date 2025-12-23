import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: '../data', // Serve files from parent data directory
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from parent directory
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

