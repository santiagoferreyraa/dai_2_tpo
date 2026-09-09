import type { RouteObject } from 'react-router'

import ContactPage from './ContactPage'

/**
 * Rutas de la feature "contact".
 *
 * Cada feature declara las suyas acá, en su propia carpeta. Así agregar una pantalla no
 * obliga a tocar ningún archivo compartido. Ver src/README.md.
 */
export const contactRoutes: RouteObject[] = [{ path: 'contact', element: <ContactPage /> }]
