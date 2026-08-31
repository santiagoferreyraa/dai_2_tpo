/**
 * Constantes del mapa: proveedor de mosaicos, límites y vista inicial.
 *
 * Separadas del componente por una razón práctica: un archivo que exporta un componente y
 * además constantes rompe el Fast Refresh de Vite, y cada cambio recarga la página entera en
 * vez de reemplazar el componente. Con el mapa eso significa perder el centro y el zoom en
 * cada guardado.
 */

import L from 'leaflet'

/**
 * Recuadro que encierra la Argentina continental, de Tierra del Fuego al límite con Bolivia.
 *
 * El mapa no es un archivo que se descargue: son mosaicos que un proveedor sirve según hacia
 * dónde esté mirando el usuario. "El mapa de Argentina" se consigue limitando la vista, no
 * bajando un país. Sin esto el usuario termina arrastrando hasta el Atlántico, sin una sola
 * estación en pantalla y sin entender por qué.
 */
export const ARGENTINA_BOUNDS = L.latLngBounds([-55.2, -73.6], [-21.7, -53.6])

/**
 * Proveedor de mosaicos: los basemaps "Canvas" de ArcGIS. Gratis, sin API key y sin registro.
 *
 * Se descartaron dos alternativas, y por qué importa:
 *
 * CARTO (`basemaps.cartocdn.com`) es el que da el look de la referencia, pero ya no es libre:
 * responde 200 y devuelve el mosaico atravesado por un "API KEY REQUIRED". No falla, se ve mal.
 *
 * OpenStreetMap crudo es libre de verdad, pero viene con parques verdes y autopistas naranjas.
 * Oscurecerlo con un filtro CSS no da un mapa oscuro: da los MISMOS colores apagados y sucios,
 * porque un filtro transforma una imagen que ya tiene color, no vuelve a dibujar el mapa.
 *
 * Estos vienen en gris de origen, sin un solo color de relleno. Sobre eso el filtro de
 * `index.css` sí funciona, porque oscurecer un gris no puede ensuciar ningún color.
 */
export const TILES = {
  dark: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  /* Para cuando entre el tema claro (RNF08). Mismo proveedor, así el mapa no cambia de
     carácter al cambiar de tema: solo de luminosidad. */
  light:
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
}

/**
 * OJO con el orden: {z}/{y}/{x}, con la fila ANTES de la columna. Es al revés que en OSM y que
 * en casi todo lo demás. Invertidos, el mapa carga igual pero muestra otro lugar del mundo.
 */

/** Obligatoria por licencia. No se saca. */
export const TILE_ATTRIBUTION =
  'Mosaicos &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/**
 * El servicio tiene mosaicos hasta el zoom 16. Del 17 en adelante devuelve 200 con un mosaico
 * vacío: el mapa se pondría negro sin un solo error que lo explique.
 *
 * De ahí los dos valores. MAX_NATIVE_ZOOM es hasta dónde se piden mosaicos; MAX_ZOOM es hasta
 * dónde puede acercarse el usuario. Entre uno y otro, Leaflet agranda el último mosaico real:
 * se ve algo borroso, pero se ve, que es mejor que negro. Y a nivel de calle hace falta pasar
 * de 16 para distinguir dos estaciones en la misma cuadra.
 */
export const MAX_NATIVE_ZOOM = 16

export const MAX_ZOOM = 18

/** Obelisco. Punto de partida mientras no haya geolocalización del usuario. */
export const DEFAULT_CENTER: L.LatLngExpression = [-34.6037, -58.3816]

export const DEFAULT_ZOOM = 12

/** Alejarse más que esto saca al país entero de escala y no muestra nada útil. */
export const MIN_ZOOM = 4

/**
 * Zoom al que se acerca el mapa cuando se elige una estación.
 *
 * Va al máximo permitido, que es lo pedido: ver la esquina exacta. Como el proveedor solo
 * tiene mosaicos hasta MAX_NATIVE_ZOOM, los dos últimos niveles son el mosaico del 16
 * agrandado y se ven algo borrosos. Bajarlo a MAX_NATIVE_ZOOM da una imagen nítida a cambio de
 * quedar más lejos; es un solo número y se cambia acá.
 */
export const FOCUS_ZOOM = MAX_ZOOM
