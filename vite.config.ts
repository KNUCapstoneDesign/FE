import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://port-0-planit-be-mcmt59q6ef387a77.sel5.cloudtype.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
