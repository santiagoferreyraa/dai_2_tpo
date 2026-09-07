/**
 * Los dos degradados de negro a transparente que enmarcan el mapa, arriba y abajo.
 *
 * No son decoración: el mapa es una imagen con zonas claras y zonas oscuras, y encima van el
 * buscador y el panel. Sin el degradado, el buscador cae sobre una avenida clara y deja de
 * leerse. Oscurecer los bordes le da un fondo estable a lo que flota ahí.
 *
 * El de abajo crece cuando se abre el panel de detalle: es lo que hace que el panel apoye
 * sobre una zona oscura en vez de cortar el mapa con una línea.
 *
 * `pointer-events-none` en los dos: son una capa visual y el mapa se sigue arrastrando a
 * través de ellos. Sin eso, la franja de arriba se comería el paneo.
 */

interface MapScrimProps {
  /** Si el panel de detalle está abierto, que es cuando el degradado de abajo se agranda. */
  expanded: boolean
}

export default function MapScrim({ expanded }: MapScrimProps) {
  return (
    <>
      {/*
        z-index por encima de los panes de Leaflet (400 los mosaicos, 600 los marcadores) y por
        debajo del buscador y del panel, que tienen que quedar sobre el degradado y no atrás.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1050] h-32 bg-gradient-to-b from-black/80 to-transparent"
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1050] bg-gradient-to-t from-black via-black/70 to-transparent transition-[height] duration-300 ${
          expanded ? 'h-2/3' : 'h-40'
        }`}
      />
    </>
  )
}
