import { useLayoutEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router'

import { isSectionActive, MAIN_SECTIONS } from './navSections'
import ProfilePill from './ProfilePill'

/**
 * La barra de escritorio y tablet: logo a la izquierda, secciones al medio, perfil a la
 * derecha.
 *
 * **Es una grilla de tres columnas y no un `flex` con `justify-between`.** La diferencia
 * importa: con `flex`, el bloque del medio queda centrado entre los dos extremos, así que su
 * posición depende de cuánto mida el logo y cuánto mida la ficha del usuario. Un nombre largo
 * corre las secciones. Con `grid-cols-[1fr_auto_1fr]` el centro está centrado **contra la
 * ventana**, que es lo que el ojo espera, y los costados crecen hacia afuera.
 *
 * **La barra es translúcida y flota sobre el contenido** (ver `App.tsx`, que la saca del flujo
 * y le deja el lugar al `<main>`). El vidrio solo se ve si hay algo detrás que mirar, así que
 * la barra tiene que estar ENCIMA del contenido y no arriba de él: al scrollear, lo que pasa
 * por debajo se difumina. Sin superponerla, `backdrop-blur` difuminaría el fondo liso de la
 * página, que es lo mismo que pintar un color plano.
 *
 * **El subrayado que marca la sección es uno solo y se desliza**, en vez de aparecer y
 * desaparecer debajo de cada enlace. Es el mismo lenguaje que el círculo del celular: una cosa
 * que viaja dice de dónde venís y a dónde fuiste; cinco que se prenden y se apagan, no.
 */
export default function DesktopNav() {
  const { pathname } = useLocation()
  const listRef = useRef<HTMLElement>(null)
  const markerRef = useRef<HTMLSpanElement>(null)

  /* Si el subrayado ya ocupó su lugar por primera vez. Ver el final de `measure`. */
  const primed = useRef(false)

  /*
   * El subrayado se mide, no se calcula: los cuatro rótulos tienen anchos distintos, así que
   * no hay fracción del ancho total que sirva —como sí la hay en el celular, donde las cinco
   * secciones son íconos iguales—.
   *
   * Se mide el ROTULO y no el enlace: el enlace incluye su padding, y un subrayado tan ancho
   * como el área clickeable se ve despegado del texto que subraya.
   *
   * La posición se escribe directo sobre el elemento y no pasa por el estado de React. No es
   * un atajo: es que el subrayado no es información de la aplicación, es el resultado de una
   * medición del navegador. Guardarlo en estado obligaría a renderizar de nuevo toda la barra
   * cada vez que cambia el ancho de la ventana, para mover dos números de un elemento que no
   * le importa a nadie más.
   *
   * `useLayoutEffect` y no `useEffect` para que esto ocurra antes de pintar: con el efecto
   * normal se alcanza a ver un cuadro con el subrayado en la sección anterior.
   *
   * El `ResizeObserver` cubre lo que un efecto sobre la ruta no ve: la ventana que cambia de
   * ancho y —el caso que de verdad se nota— la tipografía que termina de cargar y corre todos
   * los rótulos unos píxeles.
   */
  useLayoutEffect(() => {
    const list = listRef.current
    const marker = markerRef.current
    if (list === null || marker === null) return

    const measure = () => {
      const label = list.querySelector<HTMLElement>('[data-active="true"] [data-label]')

      /*
        Una ruta que no está en la barra —el detalle de una estación, mañana— no tiene qué
        subrayar. El subrayado se desvanece en su último lugar en vez de saltar a ninguna
        parte, que es la misma decisión que toma el círculo del celular.
      */
      if (label === null) {
        marker.style.opacity = '0'
        return
      }

      /*
        Se restan los dos rectángulos en vez de leer `offsetLeft`, que cuenta desde el ancestro
        posicionado más cercano: hoy es la lista, pero alcanza con que alguien le ponga
        `relative` a un enlace para que la cuenta cambie sin que nadie se entere.
      */
      const listBox = list.getBoundingClientRect()
      const labelBox = label.getBoundingClientRect()

      marker.style.width = `${labelBox.width}px`
      marker.style.transform = `translate(${labelBox.left - listBox.left}px, ${
        /* Pegado al rótulo y no al piso de la barra: subraya el texto, no la fila. */
        labelBox.bottom - listBox.top + 6
      }px)`
      marker.style.opacity = '1'

      /*
        La primera medición ocurre después del primer render, así que el subrayado pasa de "sin
        posición" a "debajo de la sección activa". Con la transición prendida eso se ve como un
        subrayado que entra deslizándose desde el borde izquierdo en CADA carga de página, que
        parece una falla y no una animación.

        Por eso arranca con la transición apagada y se la prende recién ahora. La lectura del
        rectángulo en el medio no es decorativa: obliga al navegador a aplicar los estilos de
        arriba ANTES de que la transición exista, que es lo que evita que ese primer salto se
        anime.
      */
      if (!primed.current) {
        primed.current = true
        marker.getBoundingClientRect()
        marker.classList.remove('desktop-nav__marker--idle')
      }
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [pathname])

  return (
    /*
      `z-[1050]` no es un número al azar: Leaflet apila sus panes y controles hasta 1000, así
      que por debajo de eso el zoom del mapa le pasaría por encima a la barra. Los paneles que
      suben desde abajo usan 1200 y siguen ganando, que es lo correcto: mientras hay un panel
      abierto, la barra no tiene que estorbarlo.
    */
    <header className="desktop-nav border-border/50 absolute inset-x-0 top-0 z-[1050] hidden border-b md:block">
      <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-6 px-6">
        <Link to="/" className="text-primary justify-self-start text-lg font-semibold">
          Ecopedia
        </Link>

        <nav
          ref={listRef}
          aria-label="Navegación principal"
          className="relative flex h-full items-center gap-1"
        >
          {MAIN_SECTIONS.map((section) => {
            const active = isSectionActive(section, pathname)
            return (
              <NavLink
                key={section.to}
                to={section.to}
                end={section.end}
                data-active={active ? 'true' : 'false'}
                className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  active ? 'text-primary font-semibold' : 'text-text-muted hover:text-text'
                }`}
              >
                <span data-label>{section.label}</span>
              </NavLink>
            )
          })}

          {/*
            El subrayado. Se posiciona con `transform` y no con `left` porque el navegador puede
            moverlo sin rehacer el layout de la barra en cada cuadro.

            Se dibuja siempre y se apaga con la opacidad: montarlo y desmontarlo lo haría
            aparecer de la nada en la sección nueva en vez de viajar desde la anterior.
          */}
          <span
            ref={markerRef}
            aria-hidden="true"
            className="desktop-nav__marker desktop-nav__marker--idle bg-primary absolute top-0 left-0 h-0.5 w-0 rounded-full opacity-0"
          />
        </nav>

        <div className="justify-self-end">
          <ProfilePill />
        </div>
      </div>
    </header>
  )
}
