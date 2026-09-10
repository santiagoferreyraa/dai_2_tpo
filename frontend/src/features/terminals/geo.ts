/**
 * Distancia entre dos puntos del mapa.
 *
 * **Existe aunque el backend ya devuelva `distanceKm`, y el motivo es concreto.** Esa distancia
 * la calcula `GET /api/search` contra el punto que se le consultó, así que para tenerla medida
 * desde el usuario habría que consultar centrando la búsqueda en él. Y la posición del usuario
 * no es un valor fijo: `watchPosition` avisa cada vez que se mueve, así que sería una consulta
 * nueva al backend por cada arreglo del GPS — decenas por minuto caminando por la calle, todas
 * para reordenar una lista de quince estaciones que ya está en memoria.
 *
 * Calculada acá, moverse no cuesta un solo pedido de red.
 *
 * Es la misma fórmula que usa el backend (haversine sobre una esfera), así que los dos números
 * coinciden salvo decimales. No es una aproximación distinta: es la misma cuenta hecha del otro
 * lado.
 */

/** Radio medio de la Tierra. El mismo valor que usa el backend. */
const EARTH_RADIUS_KM = 6371

/** Lo mínimo para ubicar algo. Lo cumplen `Station`, `StationResult` y `DeviceLocation`. */
export interface Located {
  latitude: number
  longitude: number
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Kilómetros en línea recta entre dos puntos.
 *
 * Línea recta y no por calles: es la misma distancia que muestra el resto de la aplicación, y
 * la que sirve para ordenar por cercanía. Cuál queda más cerca *manejando* necesitaría un grafo
 * vial, que el proyecto no tiene.
 */
export function distanceKm(from: Located, to: Located): number {
  const deltaLat = toRadians(to.latitude - from.latitude)
  const deltaLon = toRadians(to.longitude - from.longitude)

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLon / 2) ** 2

  /*
   * `asin(sqrt(a))` y no `atan2`: son equivalentes, pero esta forma es la que aparece escrita
   * en la fórmula de haversine y la que hace evidente que `a` es el cuadrado del seno de la
   * mitad del ángulo. Con distancias de ciudad no hay diferencia numérica entre las dos.
   */
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}
