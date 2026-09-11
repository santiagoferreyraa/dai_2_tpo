import ProfileCard from './components/ProfileCard'

/**
 * La sección "Reservas e historial": una sola tarjeta, todavía vacía.
 *
 * Las reservas las maneja `BookingService` (RF08), en el módulo `ecopedia-charging`, y el
 * historial de sesiones sale de `ChargingSessionService`. Ninguno de los dos existe: nadie tiene
 * una reserva todavía, así que no hay nada que listar. Es el mismo motivo por el que la tarjeta
 * de próxima carga de la portada dice que no hay ninguna. Ver `home/data/nextCharge.ts`.
 */
export default function ReservationsPage() {
  return <ProfileCard />
}
