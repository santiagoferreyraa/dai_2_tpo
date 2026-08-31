/**
 * Pantalla de estaciones.
 *
 * Dueña del estado compartido: el texto buscado y cuál es la estación elegida. El mapa y el
 * carrusel los reciben, ninguno de los dos los guarda — si cada uno tuviera los suyos, se
 * desincronizan.
 *
 * Por ahora es el mapa sobre datos fijos. Lo que sigue: la búsqueda por viewport y los filtros
 * de `SearchCriteria`.
 */

import { useMemo, useState } from 'react'

import { matchesQuery } from './model'
import { SAMPLE_STATIONS } from './sampleStations'
import StationCarousel from './StationCarousel'
import StationMap from './StationMap'
import StationSearch from './StationSearch'

export default function StationsPage() {
  const [query, setQuery] = useState('')
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null)

  const stations = useMemo(
    () => SAMPLE_STATIONS.filter((station) => matchesQuery(station, query)),
    [query],
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

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-surface flex items-baseline gap-3 border-b px-6 py-4">
        <h1 className="text-primary text-2xl font-semibold">Estaciones</h1>
        <p className="text-text-muted text-sm">
          {query === ''
            ? `${SAMPLE_STATIONS.length} estaciones de ejemplo.`
            : `${stations.length} de ${SAMPLE_STATIONS.length} estaciones.`}{' '}
          La búsqueda con filtros todavía no está conectada.
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
