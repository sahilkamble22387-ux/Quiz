import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          animation: ['framer-motion', 'gsap', 'lenis'],
          audio: ['howler'],
          spline: ['@splinetool/react-spline', '@splinetool/runtime'],
        },
      },
    },
  },
})
