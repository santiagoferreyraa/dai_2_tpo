import type {
  Connector,
  ConnectorSummary,
  ConnectorType,
  OperationalStatus,
  StationDetail,
  StationResult,
} from './types'

/**
 * Traducciones de presentación, formato de números y datos derivados de una estación.
 *
 * Está separado de los componentes porque el listado, el detalle, el formulario, el mapa y
 * el carrusel muestran los mismos valores y tienen que decir lo mismo en los cinco lugares.
 *
 * Acá viven las dos formas que tiene una estación en el frontend: `StationDetail` —la del
 * ABM, con sus conectores adentro— y `StationResult` —la que devuelve la búsqueda, con los
 * conectores que pasaron el filtro—. Los cálculos que sirven a las dos se escriben una sola
 * vez sobre la lista de conectores, que es lo único que ambas comparten.
 */

/** Etiqueta visible de un tipo de conector. En el enum es TYPE_2; en pantalla, "TYPE 2". */
export const CONNECTOR_TYPE_LABEL: Record<ConnectorType, string> = {
  CCS2: 'CCS2',
  CHADEMO: 'CHADEMO',
  TYPE_2: 'TYPE 2',
}

export const STATUS_LABEL: Record<OperationalStatus, string> = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  OUT_OF_SERVICE: 'OUT OF SERVICE',
}

/** Color de cada estado, como clase de texto. Los tokens están en terminals.css. */
export const STATUS_TEXT_CLASS: Record<OperationalStatus, string> = {
  AVAILABLE: 'text-st-available',
  OCCUPIED: 'text-st-occupied',
  OUT_OF_SERVICE: 'text-st-offline',
}

/** El mismo color como fondo, para los puntos de estado. */
export const STATUS_DOT_CLASS: Record<OperationalStatus, string> = {
  AVAILABLE: 'bg-st-available',
  OCCUPIED: 'bg-st-occupied',
  OUT_OF_SERVICE: 'bg-st-offline',
}

export const CONNECTOR_TYPES: ConnectorType[] = ['CCS2', 'CHADEMO', 'TYPE_2']

export const OPERATIONAL_STATUSES: OperationalStatus[] = ['AVAILABLE', 'OCCUPIED', 'OUT_OF_SERVICE']

/** Potencia con coma decimal y sin ceros de relleno: 8,2 kW / 22 kW. */
export function formatPower(kw: number): string {
  return `${kw.toLocaleString('es-AR', { maximumFractionDigits: 2 })} kW`
}

/**
 * Coordenada recortada a seis decimales.
 *
 * Se muestra con punto y no con coma: es notación de coordenadas, no un número de la
 * interfaz, y con coma decimal el par "-34,60; -58,38" se lee mal.
 */
export function formatCoordinate(value: number): string {
  return value.toFixed(6)
}

/**
 * Acepta coma o punto como separador decimal.
 *
 * En un teclado en castellano la coma es lo que sale natural, y `Number('-34,6')` es NaN.
 * Devuelve `null` si el texto no es un número, para distinguirlo de un cero válido.
 */
export function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(',', '.')
  if (normalized === '' || normalized === '-') return null
  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

/*
 * ---------------------------------------------------------------------------
 * Datos derivados de una lista de conectores
 *
 * Ni `StationDetail` ni `StationResult` traen "potencia de la estación" o "está
 * disponible": los dos traen conectores, y esos datos salen de recorrerlos. Se calculan acá
 * y no dentro de un componente porque el pin del mapa, la ficha del carrusel y la fila del
 * listado muestran exactamente lo mismo, y si cada uno lo calcula por su cuenta terminan
 * discrepando en algún borde.
 * ---------------------------------------------------------------------------
 */

/** Lo único que las dos vistas de una estación tienen en común. */
type AnyConnector = Pick<Connector, 'maxPowerKw' | 'operationalStatus' | 'connectorType'>

/** Potencia del conector más rápido, o `null` si la lista está vacía. */
function maxPowerOf(connectors: readonly AnyConnector[]): number | null {
  let maximum: number | null = null
  for (const connector of connectors) {
    if (maximum === null || connector.maxPowerKw > maximum) maximum = connector.maxPowerKw
  }
  return maximum
}

/** Potencia máxima entre los conectores de la estación, que es la que resume la tarjeta. */
export function maxPower(station: StationDetail): number | null {
  return maxPowerOf(station.connectors)
}

/**
 * Potencia del conector más rápido de un resultado, en kW: lo que va en el badge del pin.
 *
 * Devuelve 0 cuando no hay conectores —el badge muestra un número, no un hueco—. Puede pasar
 * aunque la estación exista: los filtros de la búsqueda podrían no dejar ninguno.
 */
export function maxPowerKw(station: StationResult): number {
  return maxPowerOf(station.matchingConnectors) ?? 0
}

/** Cuántos conectores del resultado están libres ahora mismo. */
export function availableConnectorCount(station: StationResult): number {
  return station.matchingConnectors.filter((c) => c.operationalStatus === 'AVAILABLE').length
}

/**
 * Si se puede cargar ahí en este momento.
 *
 * Alcanza con un conector libre: una estación con tres ocupados y uno disponible sirve.
 */
export function isAvailable(station: StationResult): boolean {
  return availableConnectorCount(station) > 0
}

/**
 * El conector más rápido de la estación, o `null` si no quedó ninguno tras los filtros.
 *
 * Es el que representa a la estación en la tarjeta: cuando alguien busca dónde cargar, lo que
 * decide es lo mejor que ese lugar puede ofrecerle.
 */
export function fastestConnector(station: StationResult): ConnectorSummary | null {
  let fastest: ConnectorSummary | null = null
  for (const connector of station.matchingConnectors) {
    if (fastest === null || connector.maxPowerKw > fastest.maxPowerKw) fastest = connector
  }
  return fastest
}

/**
 * Prepara un texto para comparar: sin mayúsculas, sin acentos y sin espacios de más.
 *
 * Lo de los acentos no es un lujo. Media docena de estaciones del país llevan tilde o eñe, y
 * nadie las escribe al buscar: quien tipea "nunez" espera encontrar "Recarga Núñez". NFD parte
 * cada letra acentuada en letra base + tilde, y el reemplazo se queda con la base.
 */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

/**
 * Si la estación coincide con lo que se escribió en el buscador.
 *
 * Busca en el nombre Y en la dirección: quien tiene un lugar en la cabeza a veces lo recuerda
 * por el nombre y a veces por la calle, y obligarlo a acertar cuál de los dos es hacerle
 * adivinar. Una consulta vacía no filtra nada.
 */
export function matchesQuery(station: StationResult, query: string): boolean {
  const needle = normalize(query)
  if (needle === '') return true

  return normalize(station.name).includes(needle) || normalize(station.address).includes(needle)
}
