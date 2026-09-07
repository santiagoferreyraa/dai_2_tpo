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

    /*
      Todo lo que empiece con /api se redirige al backend, así el front llama a rutas
      relativas y no hay CORS que configurar en desarrollo.

      Desde ECO-26 los backends son DOS procesos, no uno: Pagos vive en ecopedia-integration
      (puerto 8083) y el resto en ecopedia-core (8081). Ver ARQUITECTURA §6.4.

      El orden de estas claves importa: Vite se queda con la PRIMERA que coincida con la
      ruta, y '/api' coincide con todo. La regla específica tiene que ir arriba o las
      llamadas a /api/payment-methods terminan en core, que no las conoce y contesta 404.
    */
    proxy: {
      '/api/payment-methods': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
