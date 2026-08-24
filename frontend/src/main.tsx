import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

import '@/index.css'
import { router } from '@/rutas/rutas'

const contenedor = document.getElementById('root')

if (!contenedor) {
  throw new Error('No se encontró el elemento #root en index.html')
}

createRoot(contenedor).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
