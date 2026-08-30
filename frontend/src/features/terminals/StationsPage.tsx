import { useCallback, useEffect, useMemo, useState } from 'react'

import BottomSheet from './components/BottomSheet'
import StationCard from './components/StationCard'
import StationFormSheet from './components/StationFormSheet'
import StationInfoSheet from './components/StationInfoSheet'
import {
  createStation,
  deactivateStation,
  listStations,
  updateStation,
} from './data/stationsRepository'
import { CONNECTOR_TYPES, CONNECTOR_TYPE_LABEL } from './format'
import type { ConnectorType, StationDetail, StationInput } from './types'
import { useMediaQuery } from './useMediaQuery'
import { useWheelToHorizontal } from './useWheelToHorizontal'

/**
 * Listado de estaciones del operador, con el alta, la edición y el detalle.
 *
 * La pantalla tiene dos formas, y la diferencia no es de estilos sino de dónde aparece lo
 * que se está mirando:
 *
 * - En el celular, el listado ocupa todo y el detalle o el formulario suben desde abajo
 *   como un panel que tapa el fondo.
 * - En pantalla ancha entran las dos cosas a la vez: el listado a la izquierda y, fija a la
 *   derecha, la columna con el detalle o el formulario de la estación elegida.
 *
 * Lo que NO cambia entre las dos es el estado: hay un solo `sheet` que dice qué se está
 * mirando, y cada forma lo dibuja donde le corresponde. Por eso agrandar la ventana con el
 * detalle abierto lo deja abierto, ahora al costado.
 *
 * Los datos salen de data/stationsRepository, que hoy responde en memoria porque el backend
 * todavía no expone lectura. Ver el comentario de ese archivo.
 */

type Sheet =
  | { kind: 'none' }
  | { kind: 'info'; stationId: number }
  | { kind: 'edit'; stationId: number }
  | { kind: 'add' }

/**
 * Escalones de potencia del filtro.
 *
 * No son redondos por gusto: 50 kW es el piso de la carga rápida y 150 kW el de la ultra
 * rápida. Filtrar de a 10 kW no le cambia la decisión a nadie.
 */
const POWER_STEPS = [50, 150]

/** A partir de acá entran las dos columnas. Es el `lg` de Tailwind. */
const WIDE_QUERY = '(min-width: 1024px)'

export default function StationsPage() {
  const [stations, setStations] = useState<StationDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [sheet, setSheet] = useState<Sheet>({ kind: 'none' })

  const wide = useMediaQuery(WIDE_QUERY)
  const filtersRef = useWheelToHorizontal<HTMLDivElement>()

  /*
   * Los dos filtros son independientes y se combinan, pero se aplican sobre el MISMO
   * conector: "CCS2 + 150 kW" son las estaciones con un conector CCS2 que además da 150 kW,
   * no las que tienen un CCS2 lento y otro rápido de otro tipo. Es el mismo criterio que
   * usa `matchingConnectors` en la búsqueda del backend.
   */
  const [connectorType, setConnectorType] = useState<ConnectorType | null>(null)
  const [minPowerKw, setMinPowerKw] = useState<number | null>(null)

  useEffect(() => {
    /*
     * Si la pantalla se desmonta antes de que el backend conteste, la petición se cancela.
     * Cancelar hace que `fetch` rechace, y ese rechazo NO es un error para mostrar: nadie
     * está esperando la respuesta. De ahí el `aborted` antes de tocar el estado.
     */
    const controller = new AbortController()

    listStations(controller.signal)
      .then((rows) => setStations(rows))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setLoadError(
          error instanceof Error ? error.message : 'No se pudieron cargar las estaciones',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const filtering = connectorType !== null || minPowerKw !== null

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return stations.filter((station) => {
      if (needle !== '' && !station.name.toLowerCase().includes(needle)) return false
      if (!filtering) return true

      return station.connectors.some(
        (connector) =>
          (connectorType === null || connector.connectorType === connectorType) &&
          (minPowerKw === null || connector.maxPowerKw >= minPowerKw),
      )
    })
  }, [stations, query, connectorType, minPowerKw, filtering])

  /*
   * El panel se referencia por id y no por objeto: si no, después de guardar seguiría
   * mostrando la copia vieja de la estación.
   */
  const openStation =
    sheet.kind === 'info' || sheet.kind === 'edit'
      ? (stations.find((station) => station.id === sheet.stationId) ?? null)
      : null

  const closeSheet = useCallback(() => setSheet({ kind: 'none' }), [])

  const handleSubmit = async (input: StationInput) => {
    if (sheet.kind === 'edit') {
      const updated = await updateStation(sheet.stationId, input)
      setStations((rows) => rows.map((row) => (row.id === updated.id ? updated : row)))
      /*
       * En pantalla ancha la columna no se vacía después de guardar: queda mostrando el
       * detalle de lo que se acaba de editar, que es lo que el operador va a querer revisar.
       * En el celular no hay dónde mostrarlo, así que el panel se cierra.
       */
      setSheet(wide ? { kind: 'info', stationId: updated.id } : { kind: 'none' })
    } else {
      const created = await createStation(input)
      setStations((rows) => [created, ...rows])
      setSheet(wide ? { kind: 'info', stationId: created.id } : { kind: 'none' })
    }
  }

  const handleDeactivate = async (id: number) => {
    await deactivateStation(id)
    setStations((rows) => rows.filter((row) => row.id !== id))
    closeSheet()
  }

  /* Con filtro y búsqueda a la vez gana la búsqueda: es lo último que tocó el usuario. */
  const emptyMessage =
    query.trim() !== ''
      ? 'Ninguna estación coincide con la búsqueda.'
      : filtering
        ? 'Ninguna estación tiene un conector así.'
        : 'No hay estaciones para mostrar.'

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-xs whitespace-nowrap transition-colors ${
      active
        ? 'bg-st-accent font-bold text-[#12251a]'
        : 'bg-st-surface text-st-muted hover:text-st-text'
    }`

  /*
   * El formulario, escrito una sola vez para las dos formas de la pantalla. La `key` fuerza
   * uno nuevo al cambiar de estación o al pasar de alta a edición: sin ella React reusa el
   * mismo y quedan los valores del anterior.
   */
  const form = (
    <StationFormSheet
      key={sheet.kind === 'edit' ? `edit-${sheet.stationId}` : 'add'}
      station={sheet.kind === 'edit' ? openStation : null}
      onSubmit={handleSubmit}
      onDelete={openStation ? () => handleDeactivate(openStation.id) : undefined}
    />
  )

  const detail = openStation && (
    <StationInfoSheet
      station={openStation}
      onEdit={() => setSheet({ kind: 'edit', stationId: openStation.id })}
    />
  )

  return (
    /*
      El scroll vive adentro de la pantalla y no en la página: así la barra se puede ocultar
      acá sin tocarle el scroll al resto de la aplicación, y en pantalla ancha cada columna
      scrollea por su cuenta sin arrastrar a la otra.
    */
    <div className="bg-st-bg no-scrollbar h-full overflow-y-auto lg:flex lg:gap-6 lg:overflow-hidden lg:p-6">
      {/*
        Columna del listado. El ancho máximo va creciendo con la pantalla en vez de saltar:
        `max-w-md` es el diseño del celular, y en tablet se ensancha antes de que aparezca
        la segunda columna.
      */}
      <div className="no-scrollbar mx-auto w-full max-w-md px-5 pt-5 pb-10 md:max-w-2xl lg:mx-0 lg:min-w-0 lg:max-w-none lg:flex-1 lg:overflow-y-auto lg:px-3 lg:pt-0">
        <div className="flex items-center gap-3">
          <label className="relative flex-1">
            <span className="sr-only">Buscar estación por nombre</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="text-st-muted pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name station"
              className="bg-st-surface text-st-text placeholder:text-st-muted focus:outline-st-accent w-full rounded-full py-3.5 pr-4 pl-12 text-sm focus:outline-2"
            />
          </label>

          <button
            type="button"
            onClick={() => setSheet({ kind: 'add' })}
            aria-label="Agregar estación"
            className="bg-st-accent hover:bg-st-accent-strong focus-visible:outline-st-accent flex h-12 w-14 shrink-0 items-center justify-center rounded-2xl text-[#12251a] transition-colors focus-visible:outline-2"
          >
            {/*
              La cruz es un dibujo y no el carácter "+": el glifo trae su propio espacio
              arriba y abajo, distinto en cada tipografía, y nunca queda centrado del todo.
            */}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* Los filtros scrollean de costado: en un celular no entran todos. */}
        <div
          ref={filtersRef}
          className="no-scrollbar -mx-5 mt-4 flex items-center gap-2 overflow-x-auto px-5 pb-1 lg:-mx-3 lg:px-3"
        >
          <button
            type="button"
            onClick={() => {
              setConnectorType(null)
              setMinPowerKw(null)
            }}
            aria-pressed={!filtering}
            className={chipClass(!filtering)}
          >
            All
          </button>

          {CONNECTOR_TYPES.map((type) => {
            const active = connectorType === type
            return (
              <button
                key={type}
                type="button"
                /* Volver a tocar el filtro activo lo apaga: es el camino corto a "todas". */
                onClick={() => setConnectorType(active ? null : type)}
                aria-pressed={active}
                className={chipClass(active)}
              >
                {CONNECTOR_TYPE_LABEL[type]}
              </button>
            )
          })}

          {/* Separador entre las dos dimensiones del filtro: tipo de conector y potencia. */}
          <span aria-hidden="true" className="bg-st-border h-5 w-px shrink-0" />

          {POWER_STEPS.map((step) => {
            const active = minPowerKw === step
            return (
              <button
                key={step}
                type="button"
                onClick={() => setMinPowerKw(active ? null : step)}
                aria-pressed={active}
                className={chipClass(active)}
              >
                {step}+ kW
              </button>
            )
          })}
        </div>

        {loading && <p className="text-st-muted mt-8 text-center text-sm">Cargando estaciones…</p>}

        {loadError && <p className="text-st-offline mt-8 text-center text-sm">{loadError}</p>}

        {!loading && !loadError && visible.length === 0 && (
          <p className="text-st-muted mt-8 text-center text-sm">
            {stations.length === 0 ? 'Todavía no hay estaciones cargadas.' : emptyMessage}
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {visible.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              selected={wide && openStation?.id === station.id}
              onOpen={() => setSheet({ kind: 'info', stationId: station.id })}
              onEdit={() => setSheet({ kind: 'edit', stationId: station.id })}
            />
          ))}
        </ul>
      </div>

      {/*
        Pantalla ancha: la columna fija de la derecha. Es la misma información que en el
        celular muestra el panel de abajo, con la diferencia de que acá convive con el
        listado en vez de taparlo.
      */}
      {wide && (
        <aside className="no-scrollbar border-st-border bg-st-surface/30 w-[26rem] min-w-0 shrink-0 overflow-y-auto rounded-2xl border p-5 shadow-lg shadow-black/40">
          {sheet.kind === 'none' || (sheet.kind !== 'add' && openStation === null) ? (
            <p className="text-st-muted mt-10 text-center text-sm">
              Elegí una estación de la lista para ver su información, o agregá una nueva.
            </p>
          ) : sheet.kind === 'info' ? (
            detail
          ) : (
            <>
              <h2 className="text-st-muted mb-5 text-lg font-bold">
                {sheet.kind === 'edit' ? 'EDIT STATION' : 'ADD STATION'}
              </h2>
              {form}
            </>
          )}
        </aside>
      )}

      {/* Celular y tablet: lo mismo, pero como paneles que suben desde abajo. */}
      {!wide && (
        <>
          <BottomSheet
            open={sheet.kind === 'info' && openStation !== null}
            onClose={closeSheet}
            label="Detalle de la estación"
          >
            {detail}
          </BottomSheet>

          <BottomSheet
            open={sheet.kind === 'add' || (sheet.kind === 'edit' && openStation !== null)}
            onClose={closeSheet}
            label={sheet.kind === 'edit' ? 'Editar estación' : 'Nueva estación'}
          >
            {form}
          </BottomSheet>
        </>
      )}
    </div>
  )
}
