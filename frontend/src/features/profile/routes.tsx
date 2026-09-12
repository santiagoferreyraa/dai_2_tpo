import { type RouteObject } from 'react-router'

import RequireSession from '@/features/auth/RequireSession'

import EditProfilePage from './EditProfilePage'
import ProfileIndex from './ProfileIndex'
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
 * **Editar no está en el riel y sí acá.** El lápiz vive arriba, en la barra de datos, y el
 * formulario sale abajo, en la tarjeta: son dos lugares de la pantalla que no se conocen, y
 * una ruta los une sin pasarse estado entre medio. De paso, el botón de atrás cancela.
 *
 * **En escritorio `/profile` redirige; en el celular no.** En escritorio la cabecera y el riel ya
 * están a la vista, así que la ruta de entrada no tiene nada propio que mostrar y lleva a la
 * primera sección, con `replace` para que el botón de atrás no rebote. En el celular `/profile`
 * ES la lista de secciones —la dibuja `ProfileLayout`—, y redirigir la salteaba. Ver
 * `ProfileIndex`.
 */
export const profileRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProfileLayout />,
    children: [
      { index: true, element: <ProfileIndex /> },
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
      { path: 'edit', element: <EditProfilePage /> },
    ],
  },
]
