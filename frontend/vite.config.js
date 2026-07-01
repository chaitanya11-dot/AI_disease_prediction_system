import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Ensure _redirects is copied from public/ into dist/
    // (Vite does this automatically for files in public/, just being explicit)
    copyPublicDir: true,
  },
  server: {
    host: true,
    port: 5173,
  },
})
