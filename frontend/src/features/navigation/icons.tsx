/**
 * Los íconos de la navegación, dibujados a mano.
 *
 * No hay librería de íconos en el proyecto y no se agrega una por cinco dibujos: sumar una
 * dependencia va en un PR aparte (regla 7 del README) y arrastra un paquete entero para algo
 * que son cinco `path`. El trazo es el mismo que ya usa la lupa de `StationSearch`, así que
 * los íconos nuevos no desentonan con los que ya están en pantalla.
 *
 * Todos comparten la misma firma: heredan el color con `currentColor` y el tamaño se decide
 * afuera, con `className`. Así el mismo ícono sirve verde sobre el círculo activo y gris
 * apagado en el resto de la barra, sin que acá haya un solo color escrito.
 */

interface IconProps {
  className?: string
}

/**
 * `aria-hidden` en los cinco: al lado de cada ícono viaja su etiqueta de texto —visible en
 * escritorio, para lector de pantalla en el celular—, así que anunciarlos sería repetir.
 */
const BASE = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

/** Home: una casa. */
export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  )
}

/**
 * Estaciones: un surtidor con un rayo adentro.
 *
 * Es el ícono universal de la estación de carga y por eso no es una batería ni un enchufe:
 * la pantalla lista lugares donde cargar, no conectores sueltos.
 */
export function StationsIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M3 21h12" />
      <path d="m9.7 8.2-2.2 3.4h3l-2.2 3.4" />
      <path d="M14 12h3a2 2 0 0 1 2 2v2.5a1.5 1.5 0 0 0 3 0V9l-3-3" />
    </svg>
  )
}

/** Mapa: el pin de siempre. El mismo gesto que marca las estaciones sobre el mapa real. */
export function MapIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  )
}

/** Contacto: un sobre. */
export function ContactIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m3.8 7 7.1 5.3a2 2 0 0 0 2.2 0L20.2 7" />
    </svg>
  )
}

/** Perfil: la silueta de siempre. */
export function ProfileIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
    </svg>
  )
}

/**
 * El rayo del cuadrado del perfil en escritorio.
 *
 * Va relleno y sin trazo, al revés que los otros cinco: es el único que se dibuja sobre el
 * verde de la marca y a ese tamaño un contorno se ensucia.
 */
export function BoltIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.8 2 4.6 13.4a.7.7 0 0 0 .55 1.14h4.3l-1.25 7.3a.7.7 0 0 0 1.25.54l9.2-11.4a.7.7 0 0 0-.55-1.14h-4.3l1.25-7.3A.7.7 0 0 0 13.8 2Z" />
    </svg>
  )
}

/** Sol: el tema claro, en el interruptor de tema. */
export function SunIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </svg>
  )
}

/** Luna: el tema oscuro, en el interruptor de tema. */
export function MoonIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M20 13.4A8.2 8.2 0 1 1 10.6 4a6.6 6.6 0 0 0 9.4 9.4Z" />
    </svg>
  )
}

/** Hoja: lo ambiental, en la home. */
export function LeafIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <path d="M4.5 19.5c-1.5-6 2-12 9.5-13 2 0 4 .4 5.5 1 0 8-4.5 13-11 13a6 6 0 0 1-4-1Z" />
      <path d="M4 20c2-5 5.5-8.5 10-10.5" />
    </svg>
  )
}

/** Reloj: los tiempos y las ventanas de reserva, en la home. */
export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...BASE} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  )
}
