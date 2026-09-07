import type { RouteObject } from 'react-router'

import ForbiddenPage from './ForbiddenPage'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

/**
 * Rutas de la feature "auth". Las tres son públicas, por definición: son la puerta.
 *
 * `forbidden` está acá y no en la feature que la usa porque no es de ninguna: la manda el
 * guard, que vive en esta carpeta, y va a servir igual a cualquier otra pantalla que se
 * proteja por rol más adelante.
 */
export const authRoutes: RouteObject[] = [
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'forbidden', element: <ForbiddenPage /> },
]
