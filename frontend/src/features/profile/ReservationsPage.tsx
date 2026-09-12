import MyBookings from '@/features/bookings/MyBookings'

import ProfileCard from './components/ProfileCard'

/**
 * La sección "Reservas e historial": las reservas del conductor de la feature Reservas, adentro de
 * la tarjeta del perfil.
 *
 * **Es un montaje, no una copia**, igual que Medios de pago. Toda la lógica —traer las reservas,
 * separar la activa del historial, cancelar— vive en `features/bookings`. Acá solo se decide
 * DÓNDE se dibuja.
 *
 * **No lleva guard de rol, a diferencia de Medios de pago.** Esta es la sección a la que redirige
 * `/profile`, así que un guard mandaría a un operador a la pantalla de acceso denegado con solo
 * entrar a su perfil. El aviso de que las reservas son para conductores lo da el contenido.
 *
 * Todavía no hay historial de sesiones de carga: sale de `ChargingSessionService` (RF11, RF12),
 * que no existe. Lo que se ve como historial son las reservas terminadas y las canceladas.
 */
export default function ReservationsPage() {
  return (
    <ProfileCard>
      <MyBookings />
    </ProfileCard>
  )
}
