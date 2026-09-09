import type { RouteObject } from 'react-router'

import ProfilePage from './ProfilePage'

/**
 * Rutas de la feature "profile".
 *
 * Cada feature declara las suyas acá, en su propia carpeta. Así agregar una pantalla no
 * obliga a tocar ningún archivo compartido. Ver src/README.md.
 */
export const profileRoutes: RouteObject[] = [{ path: 'profile', element: <ProfilePage /> }]
