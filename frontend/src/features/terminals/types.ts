/**
 * Tipos de la feature Terminales.
 *
 * Espejan los records de la capa de negocio del backend
 * (com.ecopedia.core.terminal.domain). Si allá cambia una firma, acá cambia el tipo: es el
 * mismo contrato escrito dos veces porque son dos lenguajes, no dos diseños.
 *
 * Los nombres de campo son los que viajan en el JSON, así que van tal cual salen de Jackson.
 */

export type ConnectorType = 'CCS2' | 'CHADEMO' | 'TYPE_2'

export type OperationalStatus = 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE'

/** Alta y edición de una estación. Equivale a StationData. */
export interface StationData {
  name: string
  address: string
  latitude: number
  longitude: number
  photoUrls: string[]
}

/** Una estación como la devuelve el backend. Equivale a la entidad Station. */
export interface Station extends StationData {
  id: number
  ownerId: number
  active: boolean
}

/** Conector de una estación. Equivale a la entidad Connector. */
export interface Connector {
  id: number
  connectorType: ConnectorType
  maxPowerKw: number
  operationalStatus: OperationalStatus
}

/**
 * Filtros de la búsqueda geolocalizada. Equivale a SearchCriteria.
 *
 * `connectorType` y `minimumPowerKw` opcionales significan "sin filtro": es la única forma
 * de distinguirlo de filtrar por potencia cero.
 */
export interface SearchCriteria {
  latitude: number
  longitude: number
  radiusKm: number
  connectorType?: ConnectorType
  minimumPowerKw?: number
  onlyAvailable: boolean
}

/** Vista mínima de un conector dentro de un resultado. Equivale a ConnectorSummary. */
export interface ConnectorSummary {
  connectorId: number
  connectorType: ConnectorType
  maxPowerKw: number
  operationalStatus: OperationalStatus
}

/** Una estación tal como la devuelve la búsqueda. Equivale a StationResult. */
export interface StationResult {
  stationId: number
  name: string
  address: string
  latitude: number
  longitude: number
  distanceKm: number
  matchingConnectors: ConnectorSummary[]
}
