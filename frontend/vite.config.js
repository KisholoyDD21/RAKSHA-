import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-time proxy means the frontend can just call fetch('/api/...') and
// io() with no base URL — Vite forwards both to the backend on :5000, so
// there's no CORS configuration to fight with locally. See .env.example
// for the production alternative (VITE_API_URL).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', changeOrigin: true, ws: true },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-misc': ['socket.io-client', 'lucide-react'],
        },
      },
    },
  },
});
