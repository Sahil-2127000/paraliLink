import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,
    strictPort: true,
    // In development the React app calls /api/... and Vite forwards it to Express.
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
})
