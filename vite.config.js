import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Deploying to a subpath (e.g. GitHub Pages project site)? Set base: '/repo-name/'
  base: '/',
})
