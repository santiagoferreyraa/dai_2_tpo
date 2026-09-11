import { BellIcon, CalendarIcon, CardIcon, SlidersIcon } from '@/features/navigation/icons'

/**
 * Las secciones del perfil, en un solo lugar.
 *
 * Es el mismo criterio que `navigation/navSections.tsx` y por el mismo motivo: el riel de
 * escritorio y la cinta del celular son **dos disposiciones de la misma lista**, no dos listas.
 * Agregar una sección tiene que ser una línea acá y nada más.
 *
 * **"Perfil" ya no está en la lista, y es lo que cambió al llegar la cabecera.** Los datos del
 * usuario se ven ahora arriba de todo, en las cuatro secciones; dejarla también acá sería un
 * enlace a lo que ya se está mirando.
 *
 * **No se mezclan con las de la navegación principal.** Aquellas son los destinos de la
 * aplicación; estas viven adentro de uno de ellos, cambian el contenido de una sola pantalla y
 * no aparecen nunca en la franja de arriba ni en la barra del celular.
 */
export interface ProfileSection {
  to: string
  label: string
  Icon: (props: { className?: string }) => React.ReactElement
}

export const PROFILE_SECTIONS: ProfileSection[] = [
  { to: '/profile/notifications', label: 'Notificaciones', Icon: BellIcon },
  { to: '/profile/reservations', label: 'Reservas e historial', Icon: CalendarIcon },
  { to: '/profile/payment-methods', label: 'Medios de pago', Icon: CardIcon },
  { to: '/profile/settings', label: 'Configuración', Icon: SlidersIcon },
]
