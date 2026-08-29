import type { RouteObject } from 'react-router'

import StationsPage from './StationsPage'

/**
 * Rutas de la feature "terminals".
 *
 * Se declaran acá, no en routes/routes.tsx: agregar una pantalla a esta feature no tiene
 * que tocar ningún archivo compartido. Ver src/README.md.
 */
export const terminalRoutes: RouteObject[] = [{ path: 'stations', element: <StationsPage /> }]
