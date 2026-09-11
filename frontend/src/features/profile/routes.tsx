import { Navigate, type RouteObject } from 'react-router'

import RequireSession from '@/features/auth/RequireSession'

import NotificationsPage from './NotificationsPage'
import PaymentMethodsPage from './PaymentMethodsPage'
import ProfileLayout from './ProfileLayout'
import ReservationsPage from './ReservationsPage'
import SettingsPage from './SettingsPage'

/**
 * Rutas de la feature "profile".
 *
 * Cada feature declara las suyas acá, en su propia carpeta. Así agregar una pantalla no
 * obliga a tocar ningún archivo compartido. Ver src/README.md.
 *
 * **Las secciones son rutas hijas y la cabecera con el riel son el layout.** Con pestañas en el
 * estado de un componente, las cuatro secciones serían la misma dirección: no habría enlace a
 * los medios de pago, el botón de atrás saldría del perfil en vez de volver a la sección
 * anterior, y el riel tendría que llevar la cuenta de quién está activo. Anidadas, todo eso lo
 * resuelve el ruteo.
 *
 * **`/profile` redirige en vez de tener contenido propio.** Los datos del usuario están en la
 * cabecera, que se ve en las cuatro secciones, así que la ruta de entrada no tiene nada que
 * mostrar por su cuenta: lleva a la primera de la lista. Es `replace` para que el botón de
 * atrás no caiga de nuevo en la redirección y rebote.
 */
export const profileRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProfileLayout />,
    children: [
      { index: true, element: <Navigate to="notifications" replace /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'reservations', element: <ReservationsPage /> },
      {
        path: 'payment-methods',
        element: (
          <RequireSession roles={['CONDUCTOR']}>
            <PaymentMethodsPage />
          </RequireSession>
        ),
      },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]
