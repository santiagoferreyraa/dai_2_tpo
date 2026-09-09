import { NavLink, useLocation } from 'react-router'

import { isSectionActive, MAIN_SECTIONS } from './navSections'

/**
 * El riel de navegación de escritorio y tablet: una columna flotante de íconos, a la izquierda.
 *
 * **Es solo de íconos, y eso obliga a dos cosas.** Cada enlace lleva su `aria-label`, porque sin
 * texto un lector de pantalla anunciaría un enlace sin nombre; y cada uno muestra su rótulo al
 * pasar el mouse, porque un ícono solo no siempre se adivina. Lo segundo no reemplaza a lo
 * primero: el rótulo visible no existe para el teclado ni para el lector.
 *
 * **La marca de la sección activa se desliza**, igual que el círculo del celular y que el
 * subrayado que tenía la barra horizontal. Acá la cuenta es todavía más simple que en el
 * celular: los ítems son cuadrados iguales y apilados, así que la posición es el índice por el
 * paso, sin medir nada.
 */

/** Alto de cada ítem más la separación. Tiene que coincidir con las clases de abajo. */
const RAIL_STEP_PX = 52

export default function SideRail() {
  const { pathname } = useLocation()
  const activeIndex = MAIN_SECTIONS.findIndex((section) => isSectionActive(section, pathname))
  const hasActive = activeIndex >= 0

  return (
    /*
      Flota sobre el contenido y está centrado verticalmente contra la ventana, no contra el
      contenido: es un elemento de la aplicación y no de la pantalla que se está mirando, así
      que tiene que quedarse quieto aunque abajo cambie todo.
    */
    <nav
      aria-label="Navegación principal"
      className="fixed top-1/2 left-5 z-[1050] hidden -translate-y-1/2 md:block"
    >
      <div className="glass-panel relative flex flex-col gap-2 rounded-[26px] p-2">
        {/*
          La marca de la sección activa. Se dibuja siempre y se apaga con la opacidad: montarla
          y desmontarla la haría aparecer de la nada en la sección nueva en vez de viajar desde
          la anterior.
        */}
        <span
          aria-hidden="true"
          className="bg-primary absolute top-2 left-2 h-11 w-11 rounded-2xl transition-[transform,opacity] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            transform: `translateY(${Math.max(activeIndex, 0) * RAIL_STEP_PX}px)`,
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
              className="group relative flex h-11 w-11 items-center justify-center rounded-2xl"
            >
              <section.Icon
                className={`relative h-5 w-5 transition-colors duration-300 ${
                  active ? 'text-background' : 'text-text-muted group-hover:text-text'
                }`}
              />

              {/*
                El rótulo al pasar el mouse. `aria-hidden` porque el nombre accesible ya lo da
                el `aria-label` del enlace: sin esto, el lector lo diría dos veces.

                `pointer-events-none` para que el globo no se meta entre el mouse y el enlace
                —tocarlo cancelaría el hover y lo haría parpadear—.
              */}
              <span
                aria-hidden="true"
                className="glass-panel text-text pointer-events-none absolute left-full ml-3 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
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
