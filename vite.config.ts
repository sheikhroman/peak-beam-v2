import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => works on GitHub Pages project sites without extra config
export default defineConfig({
  plugins: [react()],
  base: './',
})
