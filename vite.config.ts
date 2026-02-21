import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use relative asset paths so production builds work on GitHub Pages project URLs.
  base: './',
  plugins: [react()],
})
