import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project site: https://maury844.github.io/pay-me-now/
  base: '/pay-me-now/',
  plugins: [react()],
})
