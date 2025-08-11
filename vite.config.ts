import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    historyApiFallback: true,
    // Configuration pour afficher tous les messages d'erreur
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Configuration pour le mode développement
  define: {
    __DEV__: true,
  },
  // Optimisations pour le débogage
  esbuild: {
    keepNames: true,
  },
}) 