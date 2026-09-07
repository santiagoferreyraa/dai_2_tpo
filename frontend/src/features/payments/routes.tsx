import type { RouteObject } from 'react-router'

import RequireSession from '@/features/auth/RequireSession'

import PaymentMethodsPage from './PaymentMethodsPage'

/**
 * Rutas de la feature "payments".
 *
 * Detrás del guard y con el rol exigido: las tarjetas son del conductor y el backend contesta
 * 403 a cualquier otro rol. Sin el rol acá, un operador con sesión entraría a una pantalla donde
 * el listado falla y el formulario también, sin nada que explique por qué. El guard lo desvía a
 * acceso denegado antes de que se dibuje.
 *
 * El administrador tampoco entra, y no es un descuido: RF03 le da la baja de usuarios y
 * estaciones, no el manejo de los medios de pago ajenos.
 */
export const paymentRoutes: RouteObject[] = [
  {
    path: 'payment-methods',
    element: (
      <RequireSession roles={['CONDUCTOR']}>
        <PaymentMethodsPage />
      </RequireSession>
    ),
  },
]
