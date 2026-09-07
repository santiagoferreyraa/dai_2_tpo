import type { RouteObject } from 'react-router'

import StationsMapPage from './StationsMapPage'
import StationsPage from './StationsPage'

/**
 * Rutas de la feature "terminals".
 *
 * Se declaran acá, no en routes/routes.tsx: agregar una pantalla a esta feature no tiene
 * que tocar ningún archivo compartido. Ver src/README.md.
 *
 * Son dos pantallas sobre las mismas estaciones y con dos tareas distintas: `/stations` es
 * el ABM del operador (RF04, RF05) y `/stations/map` es la búsqueda del conductor (RF07).
 * El mapa cuelga del ABM y no de una ruta suelta porque es la misma feature vista de otro
 * modo, y así la URL lo dice.
 */
export const terminalRoutes: RouteObject[] = [
  { path: 'stations', element: <StationsPage /> },
  { path: 'stations/map', element: <StationsMapPage /> },
]
