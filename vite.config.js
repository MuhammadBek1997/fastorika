import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://backend-fastorika.up.railway.app',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Prevent browser Basic Auth prompt caused by backend 'WWW-Authenticate'
            if (proxyRes.headers && proxyRes.headers['www-authenticate']) {
              delete proxyRes.headers['www-authenticate']
            }
          })
        }
      }
    }
  }
})
