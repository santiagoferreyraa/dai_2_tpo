import { NavLink, useLocation } from 'react-router'

import { isSectionActive, MAIN_SECTIONS } from './navSections'

/**
 * El riel de navegación de escritorio y tablet: una columna flotante de íconos, a la izquierda.
 *
 * **La marca de la sección activa es un círculo que se desliza**, entero y adentro del riel. Es
 * el mismo lenguaje que el círculo de la barra del celular —una cosa que viaja dice de dónde
 * venís y a dónde fuiste; cuatro que se prenden y se apagan, no—, pero acá no asoma por el borde
 * ni abre una muesca: el riel es angosto y se mira de costado, y un círculo colgando afuera se
 * lee como un botón despegado en vez de como parte de la barra.
 *
 * Sin muesca no hay nada que recortar, así que el riel es un `div` con vidrio y el círculo se
 * posiciona con una cuenta de una línea: los ítems son cuadrados iguales y apilados, de modo que
 * la posición es el índice por el paso.
 *
 * **Es solo de íconos, y eso obliga a dos cosas.** Cada enlace lleva su `aria-label`, porque sin
 * texto un lector de pantalla anunciaría un enlace sin nombre; y cada uno muestra su rótulo al
 * pasar el mouse, porque un ícono solo no siempre se adivina. Lo segundo no reemplaza a lo
 * primero: el rótulo visible no existe para el teclado ni para el lector.
 */

/**
 * Las medidas del riel, en píxeles. Tienen que coincidir con las clases de abajo: de ellas sale
 * dónde se para el círculo.
 *
 * El círculo mide lo mismo que un ítem, así que ocupa exactamente el cuadro del ícono que marca.
 */
const ITEM = 44
const GAP = 8
const PADDING = 10

/** De un ítem al siguiente, de centro a centro. */
const STEP = ITEM + GAP

export default function SideRail() {
  const { pathname } = useLocation()
  const activeIndex = MAIN_SECTIONS.findIndex((section) => isSectionActive(section, pathname))
  const hasActive = activeIndex >= 0

  return (
    /*
      Flota sobre el contenido y está centrado verticalmente contra la ventana, no contra el
      contenido: es un elemento de la aplicación y no de la pantalla que se está mirando, así que
      tiene que quedarse quieto aunque abajo cambie todo.
    */
    <nav
      aria-label="Navegación principal"
      className="fixed top-1/2 left-5 z-[1050] hidden -translate-y-1/2 md:block"
    >
      <div
        className="glass-panel relative flex flex-col rounded-full"
        style={{ gap: GAP, padding: PADDING }}
      >
        {/*
          El círculo. Se dibuja siempre y se apaga con la opacidad: montarlo y desmontarlo lo
          haría aparecer de la nada en la sección nueva en vez de viajar desde la anterior.

          Viaja con `transform` y no con `top` porque el navegador puede moverlo sin rehacer el
          layout de la columna en cada cuadro. La curva y la duración son las mismas que las del
          círculo del celular: son el mismo gesto y tienen que sentirse igual.
        */}
        <span
          aria-hidden="true"
          className="bg-primary absolute rounded-full transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            width: ITEM,
            height: ITEM,
            top: PADDING,
            left: PADDING,
            transform: `translateY(${Math.max(activeIndex, 0) * STEP}px)`,
            /*
              Una ruta que no es ninguna de las secciones —el perfil, o el detalle de una
              estación mañana— no tiene dónde parar el círculo. Se desvanece en su último lugar:
              no decir nada es mejor que marcar la sección equivocada.
            */
            opacity: hasActive ? 1 : 0,
          }}
        />

        {MAIN_SECTIONS.map((section) => {
          const active = isSectionActive(section, pathname)
          return (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              aria-label={section.label}
              className="group relative flex items-center justify-center"
              style={{ height: ITEM, width: ITEM }}
            >
              {/*
                El ícono se queda en su lugar y cambia de color cuando el círculo llega. No hace
                falta duplicarlo adentro del círculo —como sí pasa en el celular, donde el
                círculo se sale de la barra— porque acá los dos ocupan exactamente el mismo
                cuadro.
              */}
              <section.Icon
                className={`relative h-5 w-5 transition-colors duration-300 ${
                  active ? 'text-background' : 'text-text-muted group-hover:text-text'
                }`}
              />

              {/*
                El rótulo al pasar el mouse. `aria-hidden` porque el nombre accesible ya lo da el
                `aria-label` del enlace: sin esto, el lector lo diría dos veces.

                `pointer-events-none` para que el globo no se meta entre el mouse y el enlace
                —tocarlo cancelaría el hover y lo haría parpadear—.
              */}
              <span
                aria-hidden="true"
                className="glass-panel text-text pointer-events-none absolute left-full ml-4 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                {section.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
