import { ContactIcon, HomeIcon, MapIcon, ProfileIcon, StationsIcon } from './icons'

/**
 * Las secciones de la navegación, en un solo lugar.
 *
 * Las dos barras —la de escritorio y la del celular— leen de acá, y esa es la razón de que
 * este archivo exista: son dos disposiciones distintas de **la misma** navegación, no dos
 * navegaciones. Agregar una sección tiene que ser una línea, no dos que se pueden olvidar de
 * acompañarse.
 */

export interface NavSection {
  to: string
  label: string
  Icon: (props: { className?: string }) => React.ReactElement
  /**
   * Si la ruta solo marca activo cuando coincide exacta.
   *
   * Hace falta en `/` y en `/stations`, que son prefijo de otras: por omisión `NavLink`
   * considera activo todo prefijo de la ruta actual, así que sin esto la home quedaría
   * marcada en todas las pantallas y Estaciones se encendería mirando el mapa.
   */
  end?: boolean
}

/**
 * Las cuatro secciones del centro.
 *
 * En escritorio van al medio de la barra, como texto. En el celular son los primeros cuatro
 * íconos. El perfil no está acá porque no se comporta como ellas: ver abajo.
 */
export const MAIN_SECTIONS: NavSection[] = [
  { to: '/', label: 'Inicio', Icon: HomeIcon, end: true },
  { to: '/stations', label: 'Estaciones', Icon: StationsIcon, end: true },
  { to: '/stations/map', label: 'Mapa', Icon: MapIcon },
  { to: '/contact', label: 'Contacto', Icon: ContactIcon },
]

/**
 * El perfil, aparte de las otras cuatro.
 *
 * Es la misma sección en las dos resoluciones, pero **no se dibuja igual**: en el celular es
 * el quinto ícono de la barra y en escritorio es la ficha del usuario a la derecha, con su
 * nombre. Separarlo acá es lo que permite que cada barra lo trate como necesita sin que la
 * lista del centro tenga un caso especial adentro.
 */
export const PROFILE_SECTION: NavSection = { to: '/profile', label: 'Perfil', Icon: ProfileIcon }

/** Las cinco, en el orden en que aparecen en la barra del celular. */
export const MOBILE_SECTIONS: NavSection[] = [...MAIN_SECTIONS, PROFILE_SECTION]
