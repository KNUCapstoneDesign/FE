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
      // '/api'로 시작하는 모든 요청을 로컬 백엔드 서버로 전달합니다.
      // 이렇게 하면 프론트엔드에서 '/api/tour'로 보내는 요청도
      // 로컬 백엔드(http://localhost:5001)로 전달되어 백엔드의 프록시를 타게 됩니다.
      '/api': {
        target: 'http://localhost:5001', // 로컬 백엔드 서버 주소
        changeOrigin: true,
        secure: false,
      },
      // 백엔드에서 프록시를 처리하므로 '/tour' 프록시는 더 이상 필요 없습니다.
    },
  },
});
