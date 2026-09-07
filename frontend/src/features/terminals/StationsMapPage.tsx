/**
 * Mapa de estaciones para el conductor (RF07).
 *
 * Es la otra cara de StationsPage: ahí el operador administra sus estaciones, acá el
 * conductor busca dónde cargar. Comparten los tipos, el acceso a datos y los cálculos
 * derivados; no comparten la pantalla, porque no comparten ni la tarea ni el rol.
 *
 * Dueña del estado compartido: el texto buscado, cuál es la estación elegida y cuál su
 * conector. El mapa, el carrusel y el panel los reciben, ninguno de los tres los guarda — si
 * cada uno tuviera los suyos, se desincronizan.
 *
 * La pantalla tiene dos formas, y la diferencia no es de estilos sino de dónde aparece la
 * estación elegida:
 *
 * - En el celular no hay carrusel: los pines son la lista, y el detalle sube desde abajo como
 *   panel. Un carrusel al costado le comería el ancho al mapa, que es la pantalla.
 * - En pantalla ancha el carrusel queda, y el detalle se ancla abajo sin taparlo.
 *
 * Lo que NO cambia entre las dos es el estado: hay una sola estación elegida y un solo
 * conector elegido, y cada forma los dibuja donde le corresponde.
 *
 * Lo que sigue: la búsqueda por viewport y los filtros de `SearchCriteria`. Hoy pide una sola
 * vez todas las estaciones del país y filtra el texto en memoria, que con las quince del seed
 * alcanza y sobra; cuando el filtrado pase al backend, cambia esta llamada y ningún componente
 * de abajo se entera.
 */

import { useEffect, useMemo, useState } from 'react'
import type { LatLngTuple } from 'leaflet'

import BottomSheet from './components/BottomSheet'
import MapScrim from './components/MapScrim'
import StationCarousel from './components/StationCarousel'
import StationDetailPanel from './components/StationDetailPanel'
import StationMap from './components/StationMap'
import StationSearch from './components/StationSearch'
import { searchStations } from './data/stationsRepository'
import { matchesQuery } from './format'
import { COUNTRY_RADIUS_KM, DEFAULT_CENTER } from './mapConfig'
import { useMediaQuery } from './useMediaQuery'
import type { ConnectorSummary, StationResult } from './types'

/* El centro de la consulta, como par de números: es lo que espera `SearchCriteria`. */
const center = DEFAULT_CENTER as LatLngTuple

/**
 * A partir de acá entra el carrusel. Es el `lg` de Tailwind, el mismo corte que usa el ABM
 * para pasar a dos columnas: las dos pantallas de la feature entienden lo mismo por "ancha".
 */
const WIDE_QUERY = '(min-width: 1024px)'

/**
 * Cuánto le tapa el panel al mapa en celular, aproximado.
 *
 * Es para correr el centro del mapa al elegir una estación, no para dibujar nada, así que no
 * necesita ser el alto exacto del panel —que además depende de cuántos conectores tenga—.
 * Errarle por poco deja el pin un poco más arriba o más abajo del medio del hueco; medirlo de
 * verdad obligaría a un ResizeObserver sobre un panel que entra animado.
 */
const SHEET_INSET_PX = 380

/**
 * El conector que viene elegido de arranque: el más rápido de los que están libres.
 *
 * Libre primero y potencia después, en ese orden, porque es el orden en que decide alguien que
 * quiere cargar: de nada sirve ofrecerle el de 150 kW si está fuera de servicio. Si no hay
 * ninguno libre, el más rápido a secas, que deja el panel mostrando lo mejor que hay aunque no
 * se pueda reservar ahora.
 */
function defaultConnector(station: StationResult): ConnectorSummary | null {
  const byPower = [...station.matchingConnectors].sort((a, b) => b.maxPowerKw - a.maxPowerKw)
  return byPower.find((c) => c.operationalStatus === 'AVAILABLE') ?? byPower[0] ?? null
}

export default function StationsMapPage() {
  const [allStations, setAllStations] = useState<StationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [query, setQuery] = useState('')
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null)
  const [selectedConnectorId, setSelectedConnectorId] = useState<number | null>(null)

  const wide = useMediaQuery(WIDE_QUERY)

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
  const selectedStation = stations.find((s) => s.stationId === selectedStationId) ?? null

  /*
   * El conector elegido se resuelve contra la estación de ahora y cae en el de por omisión si
   * el guardado no le pertenece. Sin eso, cambiar de estación dejaría el panel apuntando al
   * conector de la anterior, que en esta ni existe.
   */
  const selectedConnector =
    selectedStation === null
      ? null
      : (selectedStation.matchingConnectors.find((c) => c.connectorId === selectedConnectorId) ??
        defaultConnector(selectedStation))

  function selectStation(stationId: number) {
    setSelectedStationId(stationId)
    /* El conector arranca de nuevo en cada estación: lo resuelve `defaultConnector`. */
    setSelectedConnectorId(null)
  }

  function closePanel() {
    setSelectedStationId(null)
    setSelectedConnectorId(null)
  }

  function handleReserve() {
    /*
     * RF08 —reserva de slot con seña— todavía no existe: no hay BookingService ni pantalla de
     * reserva. El botón se deja activo igual para que la regla que sí está implementada —un
     * conector fuera de servicio no se reserva— se pueda probar de verdad contra el estado
     * habilitado. Cuando entre RF08, este cuerpo pasa a ser la navegación al alta.
     */
    window.alert(
      'La reserva todavía no está disponible: llega con RF08, que incluye el cobro de la seña.',
    )
  }

  /* El encabezado dice tres cosas distintas, y ninguna sirve mientras las otras dos aplican. */
  const summary = loading
    ? 'Cargando estaciones…'
    : loadError !== null
      ? loadError
      : query === ''
        ? `${allStations.length} estaciones.`
        : `${stations.length} de ${allStations.length} estaciones.`

  /* El panel, escrito una sola vez para las dos formas de la pantalla. */
  const detail = selectedStation && (
    <StationDetailPanel
      station={selectedStation}
      selectedConnector={selectedConnector}
      onSelectConnector={setSelectedConnectorId}
      onReserve={handleReserve}
    />
  )

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="border-border bg-surface flex items-baseline gap-3 border-b px-6 py-4">
        <h1 className="text-primary text-2xl font-semibold">Mapa</h1>
        <p className={loadError !== null ? 'text-st-offline text-sm' : 'text-text-muted text-sm'}>
          {summary}
        </p>
      </header>

      {/*
        relative + min-h-0. El mapa, el buscador, los degradados y el panel se posicionan
        absolutos contra este div, así que necesita ser el contenedor de referencia; y min-h-0
        porque un ítem flex se niega por omisión a achicarse por debajo de su contenido, con lo
        que empujaría la página hacia abajo en vez de ocupar el hueco que queda.
      */}
      <div className="relative min-h-0 flex-1">
        <StationMap
          stations={stations}
          selectedStationId={selectedStation?.stationId ?? null}
          onSelect={selectStation}
          bottomInsetPx={!wide && selectedStation !== null ? SHEET_INSET_PX : 0}
          dimUnselected={selectedStation !== null}
        />

        <MapScrim expanded={selectedStation !== null} />

        {/*
          Centrado en celular y pegado a la izquierda de ahí para arriba.

          En celular el ancho se acota a lo disponible menos 6rem, que deja 3rem de cada lado:
          lo justo para no montarse sobre nada en una pantalla angosta. Plegado como burbuja no
          usa ese ancho, pero lo reserva, así que al desplegarse no salta.

          z-index por encima de los 1000 que usa Leaflet para sus controles; el porqué está
          explicado en StationCarousel.
        */}
        <div className="absolute top-4 left-4 z-[1120] w-[min(30rem,calc(100%-6rem))] md:w-96">
          <StationSearch value={query} onChange={setQuery} collapsible={!wide} />
        </div>

        {/*
          El carrusel es de pantalla ancha nada más. En celular la lista de estaciones son los
          pines, y quien quiere ver una la toca: una segunda lista encima del mapa competiría
          por el mismo espacio con el panel que se abre justo abajo.
        */}
        {wide && (
          <StationCarousel
            stations={stations}
            selectedStationId={selectedStation?.stationId ?? null}
            onSelect={selectStation}
          />
        )}

        {/*
          Pantalla ancha: el detalle anclado abajo a la izquierda, sin tapar el carrusel de la
          derecha ni cubrir el mapa entero.
        */}
        {wide && detail && (
          <aside className="border-border bg-surface/95 absolute bottom-6 left-6 z-[1120] w-[26rem] rounded-2xl border p-5 shadow-lg shadow-black/40 backdrop-blur">
            <button
              type="button"
              onClick={closePanel}
              aria-label="Cerrar detalle"
              className="text-text-muted hover:text-text absolute top-4 right-4 text-sm leading-none"
            >
              ✕
            </button>
            {detail}
          </aside>
        )}
      </div>

      {/* Celular: lo mismo, como panel que sube desde abajo. */}
      {!wide && (
        <BottomSheet
          open={selectedStation !== null}
          onClose={closePanel}
          label="Detalle de la estación"
          /* Ver el comentario de la prop: acá atrás está el mapa, y taparlo sería esconder
             el pin que se acaba de elegir. */
          dimBackground={false}
          /*
            El mismo gris que la tarjeta de escritorio: es el mismo panel en dos formas, y con
            el fondo por omisión del ABM se veía casi negro solo en el celular.

            /95 y no opaco: las filas de conector son `bg-surface/40`, así que sobre un fondo
            del MISMO color al 100% quedarían exactamente del tono del panel y se borrarían.
            Con el panel apenas translúcido conservan el escalón que se ve en el diseño.
          */
          backgroundClass="bg-surface/95 backdrop-blur"
        >
          {detail}
        </BottomSheet>
      )}
    </section>
  )
}
