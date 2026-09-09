import { searchStations } from '@/features/terminals/data/stationsRepository'
import type { ConnectorType, StationResult } from '@/features/terminals/types'

/**
 * Los números de la red que muestra la portada, sacados de las estaciones de verdad.
 *
 * **Se calculan, no se escriben.** La alternativa era poner cifras a mano en las tarjetas, y ese
 * es justo el tipo de dato que no sobrevive a la primera pregunta de "¿de dónde sale?". Acá cada
 * número sale de contar lo que el backend devuelve, así que si mañana el operador da de alta una
 * estación, la portada lo refleja sin que nadie toque nada.
 *
 * Se pide la misma búsqueda que hace el mapa —todas las estaciones del país— y se resume del lado
 * del cliente. Es aceptable con las quince del seed y deja de serlo bastante antes de que sea un
 * problema real: cuando la red crezca, esto pasa a ser un endpoint de resumen y lo único que
 * cambia es el cuerpo de `fetchNetworkStats`.
 */

/*
  El centro y el radio de la consulta.

  Están repetidos de `mapConfig` a propósito y no importados: ese archivo hace `import L from
  'leaflet'` para sus tipos, así que importarlo desde acá arrastraría la librería entera del mapa
  al paquete de la portada, por dos números. Son constantes geográficas, no configuración que
  cambie.
*/
const COUNTRY_CENTER = { latitude: -34.6037, longitude: -58.3816 }
const COUNTRY_RADIUS_KM = 4000

/** Cómo se lee cada tipo de conector en pantalla. El enum viaja en inglés técnico. */
export const CONNECTOR_LABEL: Record<ConnectorType, string> = {
  CCS2: 'CCS2',
  CHADEMO: 'CHAdeMO',
  TYPE_2: 'Tipo 2',
}

export interface ConnectorShare {
  type: ConnectorType
  label: string
  count: number
}

export interface NetworkStats {
  stationCount: number
  connectorCount: number
  /** Conectores libres ahora mismo. */
  availableCount: number
  /** La potencia más alta de la red, en kW. */
  maxPowerKw: number
  /** Cuántos conectores hay de cada tipo, de mayor a menor. */
  connectorShare: ConnectorShare[]
  /**
   * Cuántos conectores caen en cada tramo de potencia, del más lento al más rápido.
   *
   * Son tramos y no valores sueltos porque el gráfico tiene que leerse de un vistazo: veinte
   * barras de un conector cada una no dicen nada, cinco que agrupan sí.
   */
  powerBuckets: { label: string; count: number }[]
}

/** Los tramos de potencia. El último no tiene techo. */
const POWER_BUCKETS: { label: string; upTo: number }[] = [
  { label: '≤ 11', upTo: 11 },
  { label: '≤ 22', upTo: 22 },
  { label: '≤ 50', upTo: 50 },
  { label: '≤ 100', upTo: 100 },
  { label: '> 100', upTo: Number.POSITIVE_INFINITY },
]

export function summarise(stations: StationResult[]): NetworkStats {
  const connectors = stations.flatMap((station) => station.matchingConnectors)

  const byType = new Map<ConnectorType, number>()
  for (const connector of connectors) {
    byType.set(connector.connectorType, (byType.get(connector.connectorType) ?? 0) + 1)
  }

  const buckets = POWER_BUCKETS.map((bucket) => ({ label: bucket.label, count: 0 }))
  for (const connector of connectors) {
    const index = POWER_BUCKETS.findIndex((bucket) => connector.maxPowerKw <= bucket.upTo)
    /* `findIndex` no puede fallar: el último tramo no tiene techo. El guard es por las dudas. */
    if (index >= 0) buckets[index].count += 1
  }

  return {
    stationCount: stations.length,
    connectorCount: connectors.length,
    availableCount: connectors.filter((one) => one.operationalStatus === 'AVAILABLE').length,
    maxPowerKw: connectors.reduce((top, one) => Math.max(top, one.maxPowerKw), 0),
    connectorShare: [...byType.entries()]
      .map(([type, count]) => ({ type, label: CONNECTOR_LABEL[type], count }))
      .sort((a, b) => b.count - a.count),
    powerBuckets: buckets,
  }
}

export async function fetchNetworkStats(signal?: AbortSignal): Promise<NetworkStats> {
  const stations = await searchStations(
    {
      latitude: COUNTRY_CENTER.latitude,
      longitude: COUNTRY_CENTER.longitude,
      radiusKm: COUNTRY_RADIUS_KM,
      onlyAvailable: false,
    },
    signal,
  )

  return summarise(stations)
}
