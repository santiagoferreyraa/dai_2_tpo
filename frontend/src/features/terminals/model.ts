/**
 * Datos derivados de un resultado de búsqueda.
 *
 * `StationResult` no trae "potencia de la estación" ni "está disponible": trae la lista de
 * conectores que pasaron el filtro, y esos dos datos salen de recorrerla. Van acá y no dentro
 * de un componente porque el pin del mapa y la fila de la lista muestran exactamente lo mismo,
 * y si cada uno lo calcula por su cuenta terminan discrepando en algún borde.
 */

import type { ConnectorSummary, ConnectorType, OperationalStatus, StationResult } from './types'

/**
 * Potencia del conector más rápido, en kW: lo que se muestra en el badge del pin.
 *
 * Devuelve 0 cuando no hay conectores. Puede pasar aunque la estación exista: los filtros de
 * la búsqueda podrían no dejar ninguno, y en ese caso el backend igual devuelve la estación.
 */
export function maxPowerKw(station: StationResult): number {
  let maximum = 0
  for (const connector of station.matchingConnectors) {
    if (connector.maxPowerKw > maximum) maximum = connector.maxPowerKw
  }
  return maximum
}

/** Cuántos conectores están libres ahora mismo. */
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
 * Nombres de los tipos de conector como los conoce un conductor.
 *
 * El backend manda el identificador del enum (TYPE_2) y en la pantalla va el nombre comercial
 * (Tipo 2). Se escriben acá para que no queden repartidos por los componentes.
 */
export const CONNECTOR_LABELS: Record<ConnectorType, string> = {
  CCS2: 'CCS2',
  CHADEMO: 'CHAdeMO',
  TYPE_2: 'Tipo 2',
}

/** Estados operativos como se leen en pantalla. */
export const STATUS_LABELS: Record<OperationalStatus, string> = {
  AVAILABLE: 'Libre',
  OCCUPIED: 'Ocupado',
  OUT_OF_SERVICE: 'Fuera de servicio',
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
