import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'rhm-production.up.railway.app'
    ]
  },
  preview: {
    allowedHosts: [
      'rhm-production.up.railway.app'
    ]
  }
})