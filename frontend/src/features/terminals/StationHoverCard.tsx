/**
 * Tarjeta que aparece al dejar el mouse sobre un pin del mapa.
 *
 * Es un componente aparte de StationCard —la ficha del carrusel— aunque muestren datos
 * parecidos. Antes eran uno solo, y tenía sentido mientras el diseño era el mismo; dejó de
 * tenerlo cuando esta pasó a llevar el círculo montado sobre su borde izquierdo y otra
 * jerarquía tipográfica. Lo que sí comparten, que es lo que importa que no se bifurque, son
 * los datos derivados de model.ts.
 *
 * El círculo de la izquierda NO es el pin del mapa: es propio, y queda justo encima del pin,
 * tapándolo. Se dibuja acá y no allá por el orden de capas de Leaflet — el pane de los
 * tooltips va por encima del de los marcadores, así que un pin nunca podría pisar la tarjeta.
 * Al ser parte de la tarjeta, el círculo y el borde forman una sola pieza continua.
 */

import {
  availableConnectorCount,
  CONNECTOR_LABELS,
  fastestConnector,
  isAvailable,
  maxPowerKw,
} from './model'
import type { StationResult } from './types'

/* Clases completas en cada rama, nunca concatenadas: ver el comentario de stationPin.ts. */
const DOT_AVAILABLE = 'bg-primary'
const DOT_UNAVAILABLE = 'bg-text-muted'

/*
  El borde de la tarjeta y su círculo siguen la disponibilidad, igual que el pin, y no van
  siempre en verde. Si no, pasar el mouse por una estación fuera de servicio la pintaría de
  verde justo cuando el mapa la está mostrando en gris, que es la señal contraria.
*/
const ACCENT_AVAILABLE = 'border-primary'
const ACCENT_UNAVAILABLE = 'border-text-muted'
const CIRCLE_AVAILABLE = 'border-primary text-primary'
const CIRCLE_UNAVAILABLE = 'border-text-muted text-text-muted'

interface StationHoverCardProps {
  station: StationResult
}

export default function StationHoverCard({ station }: StationHoverCardProps) {
  const fastest = fastestConnector(station)
  const free = availableConnectorCount(station)
  const available = isAvailable(station)

  return (
    <article
      className={`bg-background relative w-80 rounded-2xl border-2 py-3 pr-4 pl-9 shadow-2xl ${
        available ? ACCENT_AVAILABLE : ACCENT_UNAVAILABLE
      }`}
    >
      {/*
        Un poco más grande que el pin (44 contra 40) para taparlo entero: alineado al píxel
        exacto sería frágil, y con dos círculos casi iguales se vería asomar el borde de abajo.
      */}
      <span
        aria-hidden="true"
        className={`bg-background absolute top-1/2 left-0 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 ${
          available ? CIRCLE_AVAILABLE : CIRCLE_UNAVAILABLE
        }`}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" />
        </svg>
      </span>

      <div className="flex items-center gap-2">
        <h3 className="text-text min-w-0 truncate text-base font-semibold">{station.name}</h3>

        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            available ? DOT_AVAILABLE : DOT_UNAVAILABLE
          }`}
          aria-label={available ? 'Disponible' : 'Sin conectores libres'}
        />

        {fastest !== null && (
          <span className="border-border text-text-muted ml-auto shrink-0 rounded-lg border px-2 py-1 text-xs">
            {CONNECTOR_LABELS[fastest.connectorType]}
          </span>
        )}
      </div>

      <p className="text-text-muted mt-2 flex items-center gap-2 text-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        >
          <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span className="min-w-0 truncate">{station.address}</span>
      </p>

      <div className="mt-3 flex items-end gap-6">
        <div>
          <p className="text-text-muted text-[11px]">Potencia máx</p>
          <p className="text-text text-base font-semibold">{maxPowerKw(station)} kW</p>
        </div>

        <div>
          <p className="text-text-muted text-[11px]">Libres</p>
          <p className="text-text text-base font-semibold">
            {free}/{station.matchingConnectors.length}
          </p>
        </div>

        {/*
          Señal de "hay más acá adentro", no un botón: los tooltips de Leaflet no reciben clicks
          salvo que se los declare interactivos, y aun así el mouse tendría que cruzar el hueco
          entre el pin y la tarjeta sin que se cierre. Lo que abre el detalle es el pin.
        */}
        <span
          aria-hidden="true"
          className="border-border text-text ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border"
        >
          →
        </span>
      </div>
    </article>
  )
}
