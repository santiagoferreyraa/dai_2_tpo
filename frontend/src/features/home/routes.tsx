import type { RouteObject } from 'react-router'

import HomePage from './HomePage'

/**
 * Rutas de la feature "home".
 *
 * Cada feature declara las suyas acá, en su propia carpeta. Así agregar una pantalla
 * no obliga a tocar ningún archivo compartido.
 */
export const homeRoutes: RouteObject[] = [{ index: true, element: <HomePage /> }]
