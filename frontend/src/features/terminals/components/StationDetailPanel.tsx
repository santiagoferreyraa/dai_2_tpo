/**
 * Detalle de la estación elegida en el mapa, con la elección del conector y la reserva.
 *
 * Es solo el contenido: no decide dónde se dibuja. En celular lo envuelve un BottomSheet y en
 * pantalla ancha va anclado abajo, igual que el detalle del ABM. Escribirlo una sola vez para
 * las dos formas es lo que evita que se bifurquen cuando cambie qué muestra.
 *
 * **Se elige un conector, no una estación.** RF08 reserva un conector puntual por una ventana
 * de tiempo, así que el estado que decide si se puede reservar es el del conector elegido y no
 * un resumen de la estación. Una estación con el CCS2 fuera de servicio y el Tipo 2 libre se
 * puede reservar; lo que no se puede es reservar el CCS2.
 *
 * **Sin sesión no hay botón, y eso es distinto de un botón apagado.** Reservar es a nombre de
 * alguien: sin cuenta la acción no existe todavía, no es que esté impedida por el estado del
 * conector. Un botón gris diría que el problema es la estación —que es justo lo que el panel
 * usa el gris para decir— y mandaría a probar otro conector sin que ninguno sirva. En su lugar
 * va escrito lo que falta, con el enlace para resolverlo.
 */

import { Link } from 'react-router'

import { useSession } from '@/features/auth/session'

import {
  CONNECTOR_TYPE_LABEL,
  formatPower,
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  STATUS_TEXT_CLASS,
} from '../format'
import type { ConnectorSummary, StationResult } from '../types'

interface StationDetailPanelProps {
  station: StationResult
  /** El conector elegido, o `null` si la estación no tiene ninguno tras los filtros. */
  selectedConnector: ConnectorSummary | null
  onSelectConnector: (connectorId: number) => void
  onReserve: () => void
}

export default function StationDetailPanel({
  station,
  selectedConnector,
  onSelectConnector,
  onReserve,
}: StationDetailPanelProps) {
  const session = useSession()
  const connectors = station.matchingConnectors

  /*
   * La única condición que bloquea la reserva. Un conector ocupado SÍ se puede reservar: la
   * reserva es para una ventana futura, y que esté cargando ahora no dice nada de las once de
   * la noche. Fuera de servicio es distinto, porque ahí no hay ventana que valga.
   */
  const reservable =
    selectedConnector !== null && selectedConnector.operationalStatus !== 'OUT_OF_SERVICE'

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-baseline justify-between gap-3">
        {/*
          El nombre lleva al ABM con la estación abierta, que es donde están las fotos, la
          dirección completa y el resto de los datos. Es un enlace de verdad y no un onClick
          para que se pueda abrir en otra pestaña y se vea a dónde va antes de tocarlo.
        */}
        <Link
          to={`/stations?station=${station.stationId}`}
          className="text-text hover:text-primary focus-visible:outline-primary min-w-0 text-2xl font-semibold underline-offset-4 transition-colors hover:underline focus-visible:outline-2"
        >
          {station.name}
        </Link>

        <span className="text-text-muted shrink-0 text-xs tracking-wide uppercase">
          {connectors.length === 1 ? '1 conector' : `${connectors.length} conectores`}
        </span>
      </header>

      <p className="text-text-muted -mt-3 text-sm">{station.address}</p>

      {connectors.length === 0 ? (
        /* Pasa cuando los filtros de la búsqueda no dejaron ninguno, no cuando no los hay. */
        <p className="text-text-muted text-sm">Ningún conector de esta estación coincide.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {connectors.map((connector) => {
            const selected = connector.connectorId === selectedConnector?.connectorId

            return (
              <li key={connector.connectorId}>
                <button
                  type="button"
                  onClick={() => onSelectConnector(connector.connectorId)}
                  aria-pressed={selected}
                  className={`focus-visible:outline-primary flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 ${
                    selected
                      ? 'border-primary bg-surface'
                      : 'border-border bg-surface/40 hover:bg-surface/70'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[connector.operationalStatus]}`}
                  />

                  <span className="text-text min-w-0 flex-1 text-sm font-semibold">
                    {CONNECTOR_TYPE_LABEL[connector.connectorType]}
                  </span>

                  <span className="text-text-muted shrink-0 text-sm">
                    {formatPower(connector.maxPowerKw)}
                  </span>

                  <span
                    className={`shrink-0 text-xs tracking-wide uppercase ${STATUS_TEXT_CLASS[connector.operationalStatus]}`}
                  >
                    {STATUS_LABEL[connector.operationalStatus]}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        {session === null ? (
          /*
            El aviso ocupa exactamente el lugar del botón —mismo alto, mismo radio, mismo ancho—
            para que el panel no cambie de forma al entrar o al salir. Va sobre el vidrio de
            adentro y no en verde: no es la acción de la pantalla, es la condición para que la
            acción aparezca.

            "Iniciar sesión" es un enlace de verdad, así que se puede abrir en otra pestaña y se
            ve a dónde lleva antes de tocarlo, igual que el nombre de la estación de arriba.
          */
          <div className="border-border bg-surface/60 flex w-full flex-col items-center gap-1 rounded-2xl border px-4 py-3.5 text-center">
            <p className="text-text-muted text-sm font-semibold text-balance">
              Debés iniciar sesión para poder reservar.
            </p>
            {/*
              El enlace en un renglón aparte y no adentro de la frase: el panel mide 26rem, y las
              dos palabras metidas al final del aviso caían partidas al renglón de abajo, que se
              lee como un error de armado y no como algo para tocar.
            */}
            <Link
              to="/login"
              className="text-primary focus-visible:outline-primary text-sm font-semibold underline underline-offset-4 focus-visible:outline-2"
            >
              Iniciar sesión
            </Link>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={onReserve}
              disabled={!reservable}
              className="brand-fill text-on-primary focus-visible:outline-primary disabled:bg-none disabled:bg-surface disabled:text-text-muted w-full rounded-2xl py-4 text-sm font-bold tracking-wide uppercase focus-visible:outline-2 disabled:cursor-not-allowed"
            >
              Reservar
            </button>

            {/*
              El motivo del bloqueo va escrito, no solo insinuado por el botón apagado: un botón
              gris sin explicación deja a quien lo mira sin saber si el problema es la estación,
              su cuenta o la aplicación.
            */}
            {!reservable && selectedConnector !== null && (
              <p className="text-st-offline text-center text-xs">
                Este conector está fuera de servicio. Elegí otro para reservar.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
