import type { RouteObject } from 'react-router'

import RequireSession from '@/features/auth/RequireSession'

import StationsPage from './StationsPage'

/**
 * Rutas de la feature "terminals".
 *
 * Se declaran acá, no en routes/routes.tsx: agregar una pantalla a esta feature no tiene
 * que tocar ningún archivo compartido. Ver src/README.md.
 */
/*
 * El ABM es del operador, así que va detrás del guard y además con el rol exigido. Sin el
 * rol, un conductor con sesión entraría a una pantalla donde el listado carga —esa lectura es
 * pública— y después cada botón devuelve 403; por eso el guard lo desvía a la pantalla de acceso
 * denegado antes de que este ABM llegue a dibujarse, en vez de dejarlo mirando uno que no puede usar.
 *
 * El backend deja al administrador dar de baja una estación (RF03), pero no crear ni editar,
 * así que esta pantalla sigue siendo solo del operador: darle entrada al administrador sería
 * mostrarle un formulario que no puede guardar. Su lugar es el backoffice de ECO-27.
 */
export const terminalRoutes: RouteObject[] = [
  {
    path: 'stations',
    element: (
      <RequireSession roles={['CPO']}>
        <StationsPage />
      </RequireSession>
    ),
  },
]
