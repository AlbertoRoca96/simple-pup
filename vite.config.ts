import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ 
  plugins: [react()], 
  base: process.env.BASE_PATH || '/simple-pup/',
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});