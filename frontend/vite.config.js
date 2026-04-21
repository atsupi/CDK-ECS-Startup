import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      host:true,
      port: 8080,
      '/api': 'http://localhost:3000'
    }
  }
})
