/**
 * Ficha de una estación.
 *
 * La usan dos lugares con la misma información y distinto detalle: la tarjeta flotante que
 * aparece al dejar el mouse sobre un pin, y las fichas del carrusel. Es un solo componente a
 * propósito — si fueran dos, el día que cambie qué se muestra habría que acordarse de los dos.
 *
 * No fija su ancho: lo pone quien la usa. El tooltip la quiere angosta y el carrusel la quiere
 * del ancho de la columna.
 */

import {
  availableConnectorCount,
  CONNECTOR_LABELS,
  fastestConnector,
  isAvailable,
  maxPowerKw,
  STATUS_LABELS,
} from './model'
import type { StationResult } from './types'

/* Clases completas en cada rama, nunca concatenadas: ver el comentario de stationPin.ts. */
const DOT_AVAILABLE = 'bg-primary'
const DOT_UNAVAILABLE = 'bg-text-muted'

const STATUS_TEXT = {
  AVAILABLE: 'text-primary',
  OCCUPIED: 'text-text',
  OUT_OF_SERVICE: 'text-text-muted',
}

interface StationCardProps {
  station: StationResult
  /** Con el detalle de cada conector. Solo la ficha elegida del carrusel lo despliega. */
  expanded?: boolean
}

export default function StationCard({ station, expanded = false }: StationCardProps) {
  const fastest = fastestConnector(station)
  const free = availableConnectorCount(station)

  return (
    <article className="border-border bg-background/95 w-full rounded-xl border p-3 shadow-lg">
      <div className="flex items-center gap-2">
        <h3 className="text-text min-w-0 flex-1 truncate text-sm font-semibold">{station.name}</h3>

        {/*
          El punto repite lo que ya dice el color del pin, y está bien que lo repita: la ficha
          puede quedar sobre otra estación y el pin de esta queda tapado por la propia ficha.
        */}
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            isAvailable(station) ? DOT_AVAILABLE : DOT_UNAVAILABLE
          }`}
          aria-label={isAvailable(station) ? 'Disponible' : 'Sin conectores libres'}
        />

        {fastest !== null && (
          <span className="border-border text-text-muted shrink-0 rounded-md border px-1.5 py-0.5 text-[10px]">
            {CONNECTOR_LABELS[fastest.connectorType]}
          </span>
        )}
      </div>

      <p className="text-text-muted mt-1 text-xs">{station.address}</p>

      <div className="border-border mt-3 flex items-end gap-5 border-t pt-3">
        <div>
          <p className="text-text-muted text-[10px]">Potencia máx</p>
          <p className="text-text text-sm font-semibold">{maxPowerKw(station)} kW</p>
        </div>

        <div>
          <p className="text-text-muted text-[10px]">Libres</p>
          <p className="text-text text-sm font-semibold">
            {free}/{station.matchingConnectors.length}
          </p>
        </div>

        <div>
          <p className="text-text-muted text-[10px]">Distancia</p>
          <p className="text-text text-sm font-semibold">{station.distanceKm.toFixed(1)} km</p>
        </div>
      </div>

      {expanded && (
        <ul className="border-border mt-3 flex flex-col gap-2 border-t pt-3">
          {station.matchingConnectors.map((connector) => (
            <li key={connector.connectorId} className="flex items-baseline gap-2 text-xs">
              <span className="text-text flex-1">{CONNECTOR_LABELS[connector.connectorType]}</span>
              <span className="text-text-muted">{connector.maxPowerKw} kW</span>
              <span className={`w-28 text-right ${STATUS_TEXT[connector.operationalStatus]}`}>
                {STATUS_LABELS[connector.operationalStatus]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
