/**
 * Marcador de la ubicación del dispositivo: el "estás acá".
 *
 * Mismo mecanismo que `stationPin` —un `divIcon` con HTML nuestro— y por el mismo motivo: el
 * marcador que trae Leaflet es una imagen y no se le puede colgar el halo que late.
 *
 * **Va el verde de la marca**, con el degradado entero: es un RELLENO, que es exactamente el
 * caso para el que existe la utilidad `brand-fill` (ver index.css). Y como el par de la marca
 * se redefine por tema, el punto cambia de verde solo al pasar de oscuro a claro, sin una línea
 * de JavaScript.
 *
 * La primera versión era azul, por la convención de los mapas para la posición propia y para no
 * sumar un tercer verde a una pantalla donde el verde ya significa "estación con conectores
 * libres". Se descartó: acá el punto no compite con las estaciones porque no se parece en nada
 * a una —son anillos de 40 px con un rayo y un badge de potencia, esto es un disco de 14 px con
 * borde blanco y un halo que late—, y la coherencia con la marca vale más que una convención
 * que la forma ya está resolviendo sola.
 *
 * El anillo blanco no es decorativo: es lo que despega el disco de los mosaicos. Sigue siendo
 * blanco en los dos temas, porque en el oscuro un anillo del color del fondo apagaría el punto
 * justo donde más contraste hace falta.
 *
 * No es una función como `stationPin` sino una constante: el ícono no depende de ningún dato
 * —no hay estados de la ubicación que cambien el dibujo— y Leaflet no muta los íconos que
 * recibe, así que la misma instancia sirve para todos los renders.
 */

import L from 'leaflet'

/**
 * El halo va PRIMERO en el HTML y el punto después: los dos son absolutos sobre el mismo centro
 * y el orden del documento es lo que decide cuál queda encima. Al revés, el halo tapa el punto
 * justo cuando está más opaco.
 *
 * `station-pin__ring` no se reutiliza acá aunque el círculo se parezca: aquel tiene enganchado
 * el realce del hover y el de la selección, y este marcador no se selecciona ni se toca.
 */
export const DEVICE_PIN: L.DivIcon = L.divIcon({
  // Vacío a propósito, igual que en stationPin: el valor por omisión trae fondo blanco y borde.
  className: '',
  html: `
    <div class="relative grid h-6 w-6 place-items-center">
      <span class="device-pin__pulse absolute h-6 w-6 rounded-full"></span>
      <span class="brand-fill absolute h-3.5 w-3.5 rounded-full border-2 border-white shadow-md"></span>
    </div>`,
  /*
   * El ancla va en el centro exacto del recuadro, y acá sí —a diferencia del pin de estación,
   * que ancla en el círculo de arriba porque abajo le cuelga el badge—. Este dibujo es
   * simétrico: su centro ES la posición que representa.
   */
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})
