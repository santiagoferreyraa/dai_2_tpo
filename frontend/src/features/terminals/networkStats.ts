import type { ConnectorType, OperationalStatus } from './types'

/**
 * El resumen de la infraestructura: cuántos conectores hay, de qué tipo y en qué estado.
 *
 * **Vive en Terminales y no en la portada, y eso es una decisión de producto.** Estuvo un rato en
 * la home del conductor, y ahí no servía: a quien va a cargar no le resuelve nada saber que la red
 * tiene 16 CCS2: su pregunta es dónde puede cargar ahora. Al operador sí le importa, porque es el
 * estado de lo que administra, así que el resumen se mudó a la pantalla que ya es suya.
 *
 * **Es una función pura y no pide nada.** `StationsPage` ya tiene las estaciones cargadas con sus
 * conectores, así que resumirlas es contar lo que hay en memoria. Una segunda consulta al backend
 * para los mismos datos sería trabajo de red por nada.
 */

/**
 * Lo mínimo que necesita un conector para entrar en el resumen.
 *
 * Se escribe como forma y no como uno de los tipos del dominio a propósito: `Connector` y
 * `ConnectorSummary` traen los mismos tres campos con nombres distintos alrededor, y así el
 * resumen sirve para los dos —el ABM carga uno y la búsqueda del mapa devuelve el otro— sin
 * convertir nada.
 */
export interface CountableConnector {
  connectorType: ConnectorType
  maxPowerKw: number
  operationalStatus: OperationalStatus
}

/** Cómo se lee cada tipo de conector en pantalla. El enum viaja en inglés técnico. */
export const CONNECTOR_LABEL: Record<ConnectorType, string> = {
  CCS2: 'CCS2',
  CHADEMO: 'CHAdeMO',
  TYPE_2: 'Tipo 2',
}

/** Cómo se lee cada estado operativo. Son los tres de RF05. */
export const STATUS_LABEL: Record<OperationalStatus, string> = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupado',
  OUT_OF_SERVICE: 'Fuera de servicio',
}

export interface Share<T extends string> {
  key: T
  label: string
  count: number
}

export interface NetworkStats {
  stationCount: number
  connectorCount: number
  /** La potencia más alta de la red, en kW. */
  maxPowerKw: number
  /** Cuántos conectores hay de cada tipo, de mayor a menor. */
  byType: Share<ConnectorType>[]
  /** Cuántos hay en cada estado operativo, siempre en el mismo orden. */
  byStatus: Share<OperationalStatus>[]
}

/** El orden de los estados es fijo y no por cantidad: es una escala, de mejor a peor. */
const STATUS_ORDER: OperationalStatus[] = ['AVAILABLE', 'OCCUPIED', 'OUT_OF_SERVICE']

export function summariseNetwork(
  connectors: CountableConnector[],
  stationCount: number,
): NetworkStats {
  const byType = new Map<ConnectorType, number>()
  for (const connector of connectors) {
    byType.set(connector.connectorType, (byType.get(connector.connectorType) ?? 0) + 1)
  }

  return {
    stationCount,
    connectorCount: connectors.length,
    maxPowerKw: connectors.reduce((top, one) => Math.max(top, one.maxPowerKw), 0),
    byType: [...byType.entries()]
      .map(([key, count]) => ({ key, label: CONNECTOR_LABEL[key], count }))
      .sort((a, b) => b.count - a.count),
    byStatus: STATUS_ORDER.map((key) => ({
      key,
      label: STATUS_LABEL[key],
      count: connectors.filter((one) => one.operationalStatus === key).length,
    })),
  }
}
