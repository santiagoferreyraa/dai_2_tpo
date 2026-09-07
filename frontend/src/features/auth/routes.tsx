import type { RouteObject } from 'react-router'

import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

/**
 * Rutas de la feature "auth". Las dos son públicas, por definición: son la puerta.
 */
export const authRoutes: RouteObject[] = [
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
]
