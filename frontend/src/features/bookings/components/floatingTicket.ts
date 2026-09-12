import { useCallback, useState } from 'react'

import { NAV_GEOMETRY } from '@/features/navigation/notchGeometry'

/**
 * Lo que comparten la tarjeta de la reserva del celular y su burbuja: a qué altura flotan y qué se
 * recuerda de ellas entre visitas.
 */

/**
 * A qué altura del borde de abajo de la pantalla flota la tarjeta: la barra, más el círculo de la
 * sección activa que sobresale de ella, más un poco de aire. Sale de las mismas medidas que dibujan
 * la barra, así que si la barra cambia, la tarjeta la sigue. La burbuja arranca a esa misma altura.
 */
export const FLOAT_ABOVE_PX =
  NAV_GEOMETRY.barHeight + 16 + NAV_GEOMETRY.puckSize / 2 + NAV_GEOMETRY.notchLift + 10

export interface BubblePosition {
  x: number
  y: number
}

interface Stored {
  /** La reserva que se achicó. Otra reserva vuelve a mostrarse como tarjeta. */
  collapsedBookingId: number | null
  position: BubblePosition | null
}

const STORAGE_KEY = 'ecopedia.bookingBubble'

/*
 * El almacenamiento del navegador puede no estar —modo incógnito, sitio bloqueado— y leerlo tira.
 * Sin él, la burbuja funciona igual y solo se olvida de dónde estaba al recargar.
 */
function read(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw !== null)
      return { collapsedBookingId: null, position: null, ...(JSON.parse(raw) as Partial<Stored>) }
  } catch {
    // Se sigue con los valores por omisión.
  }
  return { collapsedBookingId: null, position: null }
}

function write(next: Stored): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Sin almacenamiento no se recuerda; la pantalla sigue andando.
  }
}

/**
 * Si la tarjeta de esta reserva está achicada, y dónde quedó la burbuja.
 *
 * **Se recuerda por reserva y no para siempre.** Quien achicó la tarjeta de la reserva de hoy lo
 * hizo porque le tapaba algo; la reserva nueva de mañana tiene que volver a aparecer entera, o se
 * enteraría de ella por una burbuja que no sabe qué es. La posición sí vale para todas: es dónde le
 * queda cómoda al pulgar.
 */
export function useFloatingTicket(bookingId: number) {
  const [stored, setStored] = useState<Stored>(read)

  const update = useCallback((patch: Partial<Stored>) => {
    setStored((previous) => {
      const next = { ...previous, ...patch }
      write(next)
      return next
    })
  }, [])

  /* Estables entre renders: la tarjeta las usa como dependencias de su temporizador. */
  const collapse = useCallback(() => update({ collapsedBookingId: bookingId }), [update, bookingId])
  const expand = useCallback(() => update({ collapsedBookingId: null }), [update])
  const moveTo = useCallback((position: BubblePosition) => update({ position }), [update])

  return {
    collapsed: stored.collapsedBookingId === bookingId,
    position: stored.position,
    collapse,
    expand,
    moveTo,
  }
}
