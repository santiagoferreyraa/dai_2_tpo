import type { StationResult } from '../types'
import { searchStations } from './stationsRepository'

/**
 * Todas las estaciones de la red, para quien necesita buscarlas fuera del mapa.
 *
 * Existe porque el buscador de la barra de arriba tiene que sugerir estaciones y no tiene lista
 * de dónde sacarlas: el mapa la carga para sí mismo y no la comparte. Vive en Terminales y no en
 * la navegación porque las estaciones son de esta feature; la navegación solo las muestra.
 *
 * **Se pide una sola vez y se recuerda.** El buscador aparece en todas las pantallas, así que sin
 * memoria cada tecleo en una pantalla nueva volvería a traer la red entera. La lista cambia cuando
 * un operador da de alta una estación, que no es algo que pase mientras alguien escribe.
 */

/*
  El centro y el radio de la consulta.

  Repetidos de `mapConfig` a propósito y no importados: ese archivo hace `import L from 'leaflet'`
  para sus tipos, así que traerlo desde acá metería la librería del mapa en el paquete de la barra
  de navegación, que está en todas las pantallas. Son constantes geográficas, no configuración.
*/
const COUNTRY_CENTER = { latitude: -34.6037, longitude: -58.3816 }
const COUNTRY_RADIUS_KM = 4000

/**
 * La promesa en curso o ya resuelta.
 *
 * Se guarda la PROMESA y no el resultado, y esa es la parte que importa: si dos componentes
 * preguntan antes de que llegue la primera respuesta, los dos se cuelgan de la misma petición. Con
 * el resultado, la segunda vería el hueco vacío y dispararía otra consulta idéntica.
 */
let pending: Promise<StationResult[]> | null = null

export function fetchAllStations(): Promise<StationResult[]> {
  pending ??= searchStations({
    latitude: COUNTRY_CENTER.latitude,
    longitude: COUNTRY_CENTER.longitude,
    radiusKm: COUNTRY_RADIUS_KM,
    onlyAvailable: false,
  }).catch((error: unknown) => {
    /*
      Un fallo NO se recuerda: se borra la promesa para que el próximo intento vuelva a pedir. Sin
      esto, un backend que estuvo caído un segundo dejaría el buscador sin sugerencias para toda la
      sesión.
    */
    pending = null
    throw error
  })

  return pending
}
