/**
 * Los dos degradados de negro a transparente que enmarcan el mapa, arriba y abajo.
 *
 * No son decoración: el mapa es una imagen con zonas claras y zonas oscuras, y encima van el
 * buscador y el panel de detalle. Sin el degradado, el buscador cae sobre una avenida clara y
 * deja de leerse. Oscurecer los bordes le da un fondo estable a lo que flota ahí.
 *
 * Los dos son solo de celular, y por eso el componente entero se apaga en `md`. Es la pantalla
 * chica la que obliga a apilar todo sobre el mapa: el buscador ocupa el ancho arriba y el panel
 * de detalle sube desde abajo, de ahí que el degradado inferior crezca con `expanded` para
 * recibirlo. De tablet para arriba la interfaz deja de estar encima del mapa —el carrusel se va
 * al costado derecho, con su propio degradado— y estas dos franjas no enmarcarían nada: serían
 * bandas negras tapando mapa.
 *
 * Van a media opacidad y no a negro pleno. El trabajo es darle contraste a lo que flota
 * encima, no esconder el mapa: si el borde queda opaco, en una pantalla chica —donde el mapa
 * ES la pantalla— se pierde justo la parte que le da contexto a los pines de arriba y abajo.
 *
 * `pointer-events-none` en los dos: son una capa visual y el mapa se sigue arrastrando a
 * través de ellos. Sin eso, la franja de arriba se comería el paneo.
 */

interface MapScrimProps {
  /** Si el degradado de abajo tiene que agrandarse para recibir al panel de detalle. */
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
        className="pointer-events-none absolute inset-x-0 top-0 z-[1050] h-32 bg-gradient-to-b from-black/55 to-transparent md:hidden"
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[1050] bg-gradient-to-t from-black/75 via-black/40 to-transparent transition-[height] duration-300 md:hidden ${
          expanded ? 'h-2/3' : 'h-40'
        }`}
      />
    </>
  )
}
