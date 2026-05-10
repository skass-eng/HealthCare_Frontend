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
    host: '0.0.0.0',
    historyApiFallback: true,
    // Autoriser tous les hôtes (nécessaire pour tunnels et accès réseau)
    allowedHosts: ['.pulse-360.fr', '.ngrok-free.dev', '.ngrok.io', '.loca.lt', '.trycloudflare.com', 'localhost', '127.0.0.1', '192.168.1.151', 'MI-W15XDCK3'],
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