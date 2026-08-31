/**
 * Marcador de una estación en el mapa.
 *
 * Leaflet trae un marcador propio —el pin azul— pero es una imagen: no se le puede cambiar el
 * color ni colgarle el dato de la potencia. `divIcon` lo reemplaza por HTML nuestro, que es lo
 * que permite el círculo con el ícono arriba y el badge abajo.
 */

import L from 'leaflet'

import { isAvailable, maxPowerKw } from './model'
import type { StationResult } from './types'

/**
 * Las clases se escriben COMPLETAS en cada rama del ternario, nunca armadas por concatenación.
 *
 * Tailwind no ejecuta el código: busca nombres de clase como texto plano en los archivos del
 * proyecto y genera solo los que encuentra. Un `border-${color}` no aparece en ningún lado, así
 * que el CSS no existe y el pin sale sin borde, sin ningún error que lo delate.
 */
const AVAILABLE_RING = 'border-primary text-primary'
/* El gris va con el color del texto secundario y no con el del borde: sobre el mapa oscuro,
   un anillo #273146 se confunde con el fondo y la estación desaparece en vez de leerse
   como "no disponible". */
const UNAVAILABLE_RING = 'border-text-muted text-text-muted'

/** Ícono de rayo, en línea: un <img> serían 15 pedidos más al servidor, uno por estación. */
const BOLT_SVG =
  '<svg viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5" aria-hidden="true">' +
  '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" /></svg>'

/**
 * Arma el ícono de una estación: círculo con el rayo y, colgando, la potencia del conector más
 * rápido. Verde si hay al menos un conector libre, gris si no.
 *
 * `station-pin__ring` es el punto de enganche del halo de realce, que se define en index.css:
 * el hover NO puede llegar hasta acá, porque cambiar el ícono reemplaza el elemento del DOM y
 * el mouseout resultante realimentaría el propio hover. La selección sí, que no depende del mouse.
 *
 * En el HTML no se interpola ningún texto que venga del backend —solo un número ya calculado—,
 * así que un nombre de estación con comillas o con `<script>` no puede romper nada acá.
 */
export function stationPin(station: StationResult, selected: boolean): L.DivIcon {
  const ring = isAvailable(station) ? AVAILABLE_RING : UNAVAILABLE_RING
  const selectedRing = selected ? 'station-pin__ring--selected' : ''

  return L.divIcon({
    // Vacío a propósito: con el valor por omisión Leaflet le mete su fondo blanco y su borde.
    className: '',
    html: `
      <div class="flex flex-col items-center">
        <div class="station-pin__ring ${selectedRing} bg-background ${ring} grid h-10 w-10 place-items-center rounded-full border-2 shadow-md">
          ${BOLT_SVG}
        </div>
        <span class="station-pin__badge border-border bg-background text-text mt-1 rounded-full border px-2 py-0.5 text-xs font-semibold whitespace-nowrap shadow-sm">
          ${maxPowerKw(station)} kW
        </span>
      </div>`,
    // El alto reserva el círculo y el badge; el ancla cae en el centro del círculo, que es lo
    // que marca la ubicación. Con el ancla en el centro del recuadro, el pin queda corrido
    // hacia arriba y las estaciones aparecen media cuadra más al norte de donde están.
    iconSize: [40, 64],
    iconAnchor: [20, 20],
  })
}
