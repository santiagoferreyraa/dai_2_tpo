/**
 * Llamadas al backend de Terminales.
 *
 * El único archivo del frontend que conoce la forma real de los endpoints. El resto de la
 * feature habla en `SearchCriteria`, que es el contrato de dominio escrito en types.ts.
 */

import { api } from '@/lib/api'

import type { SearchCriteria, StationResult } from './types'

/**
 * RF07: búsqueda geolocalizada con filtros.
 *
 * El controlador expone `GET /api/busqueda` con los parámetros en castellano y con nombres
 * que NO son los del contrato: `lat`, `lon` y sobre todo `radioKm`, donde `SearchCriteria`
 * dice `latitude`, `longitude` y `radiusKm`. La traducción vive acá, en un solo lugar; si se
 * unifican las rutas de ARQUITECTURA §2.3, se corrige este objeto y ningún componente se entera.
 *
 * `connectorType` y `minimumPowerKw` en `undefined` no se envían —el cliente HTTP descarta las
 * claves indefinidas—, y el backend los toma como "sin filtro".
 *
 * @param signal para cancelar la petición si el usuario vuelve a mover el mapa antes de que
 *               responda; sin esto, dos respuestas fuera de orden dejan la lista con los
 *               resultados de la búsqueda vieja.
 */
export function searchStations(
  criteria: SearchCriteria,
  signal?: AbortSignal,
): Promise<StationResult[]> {
  return api.get<StationResult[]>('/busqueda', {
    params: {
      lat: criteria.latitude,
      lon: criteria.longitude,
      radioKm: criteria.radiusKm,
      connectorType: criteria.connectorType,
      minimumPowerKw: criteria.minimumPowerKw,
      onlyAvailable: criteria.onlyAvailable,
    },
    signal,
  })
}
