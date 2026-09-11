import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      // Permite importar como "@/componentes/Foo" en vez de "../../componentes/Foo".
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,

    // Todo lo que empiece con /api se redirige al backend.
    // Así el front llama a rutas relativas y no hay CORS que configurar en desarrollo.
    //
    // Reservas vive en otro proceso (ecopedia-charging, 8082), así que sus rutas se desvían
    // antes. El orden importa: Vite usa la PRIMERA regla que coincide, y '/api' a secas también
    // coincide con '/api/bookings'. Puesta después, se la comería la de core.
    proxy: {
      '/api/bookings': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
