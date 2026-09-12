import { useMyBookings } from './data/myBookingsStore'
import { nextBooking } from './timeline'
import { useNow } from './useNow'

/**
 * El punto que titila sobre el ícono de "Reservas e historial" cuando hay una reserva activa.
 *
 * **Es el aviso del perfil, en lugar de la franja.** En el perfil la franja no aparece —la cabecera
 * y la tarjeta ya ocupan lo de arriba—, así que quien está ahí tiene que enterarse de otra forma de
 * que tiene una reserva. Un punto en la esquina del ícono dice "acá hay algo" sin repetir la
 * información, que está a un toque.
 *
 * Se posiciona en la esquina de arriba a la derecha de su contenedor, que tiene que ser `relative`.
 * No dibuja nada sin reserva activa, con la misma regla que la franja (`nextBooking`).
 */
export default function ActiveBookingDot() {
  const state = useMyBookings()
  /* El minuto alcanza: solo decide si hay una activa, no cuánto falta. */
  const now = useNow(60_000)

  if (state.status !== 'ready' || nextBooking(state.bookings, now) === null) return null

  return (
    <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
      <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-70 motion-reduce:animate-none" />
      <span className="bg-primary ring-background relative inline-flex h-2.5 w-2.5 rounded-full ring-2" />
    </span>
  )
}
