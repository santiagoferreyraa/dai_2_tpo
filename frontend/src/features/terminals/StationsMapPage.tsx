/**
 * Mapa de estaciones para el conductor (RF07).
 *
 * Es la otra cara de StationsPage: ahí el operador administra sus estaciones, acá el
 * conductor busca dónde cargar. Comparten los tipos, el acceso a datos y los cálculos
 * derivados; no comparten la pantalla, porque no comparten ni la tarea ni el rol.
 *
 * Dueña del estado compartido: el texto buscado y cuál es la estación elegida. El mapa y el
 * carrusel los reciben, ninguno de los dos los guarda — si cada uno tuviera los suyos, se
 * desincronizan.
 *
 * Lo que sigue: la búsqueda por viewport y los filtros de `SearchCriteria`. Hoy pide una sola
 * vez todas las estaciones del país y filtra el texto en memoria, que con las quince del seed
 * alcanza y sobra; cuando el filtrado pase al backend, cambia esta llamada y ningún componente
 * de abajo se entera.
 */

import { useEffect, useMemo, useState } from 'react'

import type { LatLngTuple } from 'leaflet'

import StationCarousel from './components/StationCarousel'
import StationMap from './components/StationMap'
import StationSearch from './components/StationSearch'
import { searchStations } from './data/stationsRepository'
import { matchesQuery } from './format'
import { COUNTRY_RADIUS_KM, DEFAULT_CENTER } from './mapConfig'
import type { StationResult } from './types'

/* El centro de la consulta, como par de números: es lo que espera `SearchCriteria`. */
const center = DEFAULT_CENTER as LatLngTuple

export default function StationsMapPage() {
  const [allStations, setAllStations] = useState<StationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null)

  useEffect(() => {
    /*
     * Si la pantalla se desmonta antes de que el backend conteste, la petición se cancela.
     * Cancelar hace que `fetch` rechace, y ese rechazo NO es un error para mostrar: nadie
     * está esperando la respuesta. De ahí el `aborted` antes de tocar el estado.
     */
    const controller = new AbortController()

    searchStations(
      {
        latitude: center[0],
        longitude: center[1],
        radiusKm: COUNTRY_RADIUS_KM,
        onlyAvailable: false,
      },
      controller.signal,
    )
      .then((rows) => setAllStations(rows))
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

  const stations = useMemo(
    () => allStations.filter((station) => matchesQuery(station, query)),
    [allStations, query],
  )

  /**
   * La selección se ignora si la estación quedó fuera de la búsqueda, pero NO se borra.
   *
   * Es a propósito: quien busca "tigre", elige esa estación y después limpia el buscador, se
   * la vuelve a encontrar elegida donde la dejó. Borrando el estado, ese ida y vuelta le
   * costaría volver a buscarla.
   */
  const visibleSelectedId = stations.some((station) => station.stationId === selectedStationId)
    ? selectedStationId
    : null

  /* El encabezado dice tres cosas distintas, y ninguna sirve mientras las otras dos aplican. */
  const summary = loading
    ? 'Cargando estaciones…'
    : loadError !== null
      ? loadError
      : query === ''
        ? `${allStations.length} estaciones.`
        : `${stations.length} de ${allStations.length} estaciones.`

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-surface flex items-baseline gap-3 border-b px-6 py-4">
        <h1 className="text-primary text-2xl font-semibold">Mapa</h1>
        <p className={loadError !== null ? 'text-st-offline text-sm' : 'text-text-muted text-sm'}>
          {summary}
        </p>
      </header>

      {/*
        relative + min-h-0. El mapa, el buscador y el carrusel se posicionan absolutos contra
        este div, así que necesita ser el contenedor de referencia; y min-h-0 porque un ítem
        flex se niega por omisión a achicarse por debajo de su contenido, con lo que empujaría
        la página hacia abajo en vez de ocupar el hueco que queda.

        El carrusel va DENTRO y no al lado: se superpone al mapa en vez de empujarlo, así el
        mapa conserva todo el ancho de la pantalla.
      */}
      <div className="relative min-h-0 flex-1">
        <StationMap
          stations={stations}
          selectedStationId={visibleSelectedId}
          onSelect={setSelectedStationId}
        />

        {/*
          Centrado en celular y pegado a la izquierda de ahí para arriba.

          En celular el ancho se acota a lo disponible menos 6rem, que deja 3rem de cada lado:
          lo justo para no montarse sobre nada en una pantalla angosta.

          z-index por encima de los 1000 que usa Leaflet para sus controles; el porqué está
          explicado en StationCarousel.
        */}
        <div className="absolute top-4 left-1/2 z-[1120] w-[min(30rem,calc(100%-6rem))] -translate-x-1/2 md:left-4 md:w-96 md:translate-x-0">
          <StationSearch value={query} onChange={setQuery} />
        </div>

        <StationCarousel
          stations={stations}
          selectedStationId={visibleSelectedId}
          onSelect={setSelectedStationId}
        />
      </div>
    </section>
  )
}
