import type { ConnectorType, OperationalStatus, StationDetail } from './types'

/**
 * Traducciones de presentación y formato de números.
 *
 * Está separado de los componentes porque el listado, el detalle y el formulario muestran
 * los mismos valores y tienen que decir lo mismo en los tres lugares.
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

/** Potencia máxima entre los conectores de la estación, que es la que resume la tarjeta. */
export function maxPower(station: StationDetail): number | null {
  if (station.connectors.length === 0) return null
  return Math.max(...station.connectors.map((c) => c.maxPowerKw))
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
