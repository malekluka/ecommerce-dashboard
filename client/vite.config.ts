import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk - all node_modules
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Charts chunk - recharts library
          charts: ['recharts'],
          // Utils chunk
          utils: ['axios', 'jwt-decode'],
          // Icons chunk
          icons: ['react-icons', 'lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb
  },
})