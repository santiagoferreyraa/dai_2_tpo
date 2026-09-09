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
import { useSearchParams } from 'react-router'
import type { LatLngTuple } from 'leaflet'

import BottomSheet from './components/BottomSheet'
import MapScrim from './components/MapScrim'
import StationCarousel from './components/StationCarousel'
import StationDetailPanel from './components/StationDetailPanel'
import StationFilters from './components/StationFilters'
import StationMap from './components/StationMap'
import StationSearch from './components/StationSearch'
import { searchStations } from './data/stationsRepository'
import { matchesFilters, matchesQuery } from './format'
import type { ConnectorFilters } from './format'
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

  /*
   * La búsqueda puede venir de la dirección (`?q=`) o escribirse acá.
   *
   * Las dos cosas tienen que convivir. El buscador de la barra de arriba no filtra nada por su
   * cuenta —no tiene la lista— así que lo que hace es traer el texto hasta acá por la dirección;
   * el de adentro del mapa sí filtra en vivo. Que viaje por la dirección y no por el estado del
   * router es lo que deja el resultado compartible y recargable.
   *
   * El estado se ajusta DURANTE el render y no en un efecto. Es el patrón que recomienda React
   * para el estado que se deriva de algo de afuera, y el mismo que usa `BottomSheet`: hecho en un
   * efecto, se alcanza a ver un cuadro con la lista filtrada por la búsqueda anterior.
   *
   * Se compara contra la última dirección vista y no contra `query` a secas: si se copiara
   * siempre, borrar el texto a mano lo repondría desde la dirección en el render siguiente y el
   * campo no se dejaría vaciar nunca.
   */
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(urlQuery)
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery)

  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

  /*
   * Los filtros viven acá arriba y no adentro de StationFilters por el mismo motivo que el
   * texto buscado: el mapa, el carrusel y el encabezado tienen que estar mirando la misma
   * lista de estaciones. Con el estado adentro del componente, los filtros serían suyos y
   * nadie más se enteraría de que hay algo filtrado.
   */
  const [filters, setFilters] = useState<ConnectorFilters>({
    connectorType: null,
    minPowerKw: null,
  })

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
    () =>
      allStations.filter(
        (station) =>
          matchesQuery(station, query) && matchesFilters(station.matchingConnectors, filters),
      ),
    [allStations, query, filters],
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
      : query === '' && filters.connectorType === null && filters.minPowerKw === null
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
    /*
      De tablet para arriba el mapa vive adentro de una tarjeta redondeada, separada de los
      bordes: es la disposición que pidió el diseño y hace juego con los recuadros de la portada.

      En el celular NO: ahí sigue a sangre. El aire de los costados le come ancho a la única
      pantalla que es puro mapa, y la barra de navegación de abajo está pensada para flotar sobre
      los mosaicos, no sobre un margen.
    */
    <section className="flex min-h-0 flex-1 flex-col md:px-6 md:pb-6">
      <div className="border-border/60 relative flex min-h-0 flex-1 flex-col overflow-hidden md:rounded-3xl md:border md:shadow-xl">
        {/*
          El título queda solo para lectores de pantalla. La franja que lo mostraba se sacó porque
          le comía alto al mapa, que es toda la pantalla; el encabezado en sí no se puede borrar
          —una página sin `h1` deja a quien navega por estructura sin saber dónde está— y la barra
          de arriba ya dice "Mapa" a la vista.
        */}
        <h1 className="sr-only">Mapa</h1>

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

          {/*
          El degradado de abajo se agranda solo en celular. Ahí el panel ocupa el ancho entero
          y necesita apoyarse sobre algo oscuro; acá el panel es una tarjeta en la esquina, y
          un degradado de dos tercios a todo el ancho oscurece medio mapa para enmarcarla.
        */}
          <MapScrim expanded={!wide && selectedStation !== null} />

          {/*
          Centrado en celular y pegado a la izquierda de ahí para arriba.

          En celular el ancho se acota a lo disponible menos 6rem, que deja 3rem de cada lado:
          lo justo para no montarse sobre nada en una pantalla angosta. Plegado como burbuja no
          usa ese ancho, pero lo reserva, así que al desplegarse no salta.

          z-index por encima de los 1000 que usa Leaflet para sus controles; el porqué está
          explicado en StationCarousel.
        */}
          <div className="absolute top-4 left-4 z-[1120] flex w-[calc(100%-2rem)] flex-wrap items-start gap-2 lg:w-[calc(100%-23rem)]">
            {/*
            En celular el buscador toma el ancho entero de la fila, que ya viene con 1rem de
            aire de cada lado: desplegado queda centrado por simetría, sin cálculos. El `mx-auto`
            cubre el caso de la tablet angosta, donde el tope de 30rem deja espacio libre y sin
            él la barra quedaría pegada a la izquierda.

            Plegado como burbuja el ancho igual se reserva, así que al desplegarse no salta.

            En pantalla ancha la fila se corta antes de llegar al carrusel (20rem de fichas más
            aire). No es estético: esta capa va por ENCIMA del carrusel, así que una burbuja que
            llegue hasta allá le queda dibujada arriba de las fichas.
          */}
            <div className="mx-auto w-[min(30rem,100%)] shrink-0 md:mx-0 md:w-96">
              <StationSearch value={query} onChange={setQuery} collapsible={!wide} />
            </div>

            {/*
            Los filtros no van en celular: ver el comentario de StationFilters.

            Envuelven en vez de scrollear de costado, al revés que en el ABM. Ahí la fila de
            filtros es un renglón dedicado y el scroll horizontal se entiende; acá flotan sobre
            el mapa, sin barra ni borde que insinúe que hay más a la derecha, y lo que no entra
            simplemente no se encontraría. Envolviendo se ven todos, que son seis.
          */}
            <div className="hidden min-w-0 flex-wrap items-center gap-2 md:flex">
              <StationFilters value={filters} onChange={setFilters} />
            </div>

            {/*
              El resumen, donde antes estaba la franja: cuántas estaciones se ven, si están
              cargando, o qué falló.

              No es un adorno que sobrevivió a la franja. Es el ÚNICO lugar donde aparece un error
              de carga, así que sacarlo del todo dejaba a la pantalla fallando en silencio: el mapa
              vacío y nadie explicando por qué. Por eso se pinta en rojo cuando algo se rompió, que
              es lo que lo saca de ser un dato al pasar.

              `md:ml-auto` lo manda al extremo de la fila, lejos del buscador y de los filtros: es
              información, no un control, y no tiene por qué competir con ellos por la atención. En
              el celular no, porque ahí el buscador ocupa el renglón entero y la ficha cae abajo:
              empujada a la derecha quedaría colgando sola en el aire.
            */}
            <p
              className={`glass-panel shrink-0 rounded-full px-3 py-1.5 text-xs font-medium md:ml-auto ${
                loadError !== null ? 'text-danger' : 'text-text-muted'
              }`}
              /* Los errores se anuncian solos; el conteo no interrumpe. */
              role={loadError !== null ? 'alert' : undefined}
            >
              {summary}
            </p>
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
          Pantalla ancha: el detalle sube desde el borde de abajo, pegado a él y sin esquinas
          redondeadas. Apoya contra el borde en vez de flotar sobre el mapa, que es lo que lo
          hace leer como una parte de la pantalla y no como una tarjeta suelta. Queda a la
          izquierda para no taparle el carrusel de la derecha.

          Separado del borde izquierdo y no pegado a él: apoyado contra la esquina el panel
          se lee como un pedazo de la ventana, y separado se lee como algo apoyado sobre el
          mapa, que es lo que es.
        */}
          {wide && detail && (
            <aside className="station-panel border-border bg-surface/95 absolute bottom-0 left-12 z-[1120] flex w-[26rem] flex-col border border-b-0 shadow-lg shadow-black/40 backdrop-blur">
              {/*
              La flecha ocupa el ancho entero y no es un ícono en una esquina: apunta hacia
              abajo, que es a donde se va el panel, y esa franja es el blanco más grande que
              se puede dar para cerrarlo.
            */}
              <button
                type="button"
                onClick={closePanel}
                aria-label="Cerrar detalle"
                className="border-border text-text-muted hover:text-text hover:bg-surface focus-visible:outline-primary flex w-full shrink-0 justify-center border-b py-2 transition-colors focus-visible:-outline-offset-2 focus-visible:outline-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {/*
              El contenido scrollea por su cuenta y el panel se topa contra el alto del mapa:
              una estación con muchos conectores no puede empujar el botón de reservar fuera
              de la pantalla.
            */}
              <div className="no-scrollbar max-h-[60vh] overflow-y-auto p-5">{detail}</div>
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
      </div>
    </section>
  )
}
