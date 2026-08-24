import type { RouteObject } from 'react-router'

import PaginaInicio from './PaginaInicio'

/**
 * Rutas de la feature "inicio".
 *
 * Cada feature declara las suyas acá, en su propia carpeta. Así agregar una pantalla
 * no obliga a tocar ningún archivo compartido.
 */
export const rutasInicio: RouteObject[] = [{ index: true, element: <PaginaInicio /> }]
