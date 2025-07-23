import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kanoodle/', // Update this to match your repository name
  build: {
    outDir: 'docs'
  }
})
