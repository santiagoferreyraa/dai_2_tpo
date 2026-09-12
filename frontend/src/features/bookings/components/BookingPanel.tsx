import { useId } from 'react'

import type { ConnectorSummary, StationResult } from '@/features/terminals/types'

import type { Booking } from '../types'
import { useBookingFlow } from '../useBookingFlow'
import BookingForm from './BookingForm'

/**
 * Reservar un conector en el celular: el mismo contenido que el diálogo, adentro del panel que
 * sube desde abajo en lugar del detalle de la estación.
 *
 * No hay ventana ni fondo oscurecido: en una pantalla chica el panel ya ocupa la mitad de abajo, y
 * un diálogo encima sería un recuadro sobre otro recuadro. Salir sin reservar vuelve al detalle, y
 * por eso el botón dice "Volver" y no "Cancelar".
 */
interface BookingPanelProps {
  station: StationResult
  connector: ConnectorSummary
  /** Volver al detalle de la estación sin reservar. */
  onBack: () => void
  /** Terminar después de confirmar. */
  onDone: (booking: Booking) => void
}

export default function BookingPanel({ station, connector, onBack, onDone }: BookingPanelProps) {
  const flow = useBookingFlow(connector.connectorId)
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      <BookingForm
        station={station}
        connector={connector}
        flow={flow}
        titleId={titleId}
        onCancel={onBack}
        cancelLabel="Volver"
        onDone={onDone}
      />
    </section>
  )
}
