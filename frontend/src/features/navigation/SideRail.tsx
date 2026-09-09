import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router'

import { isSectionActive, MAIN_SECTIONS } from './navSections'
import {
  RAIL_GEOMETRY,
  RAIL_NOTCH_LIFT,
  RAIL_PUCK_SIZE,
  RAIL_STEP,
  RAIL_WIDTH,
  railClipPath,
  railHeight,
  railItemCenter,
} from './notchGeometry'

/**
 * El riel de navegación de escritorio y tablet: una columna flotante de íconos, a la izquierda,
 * con el círculo verde asomando por su borde derecho.
 *
 * **Es la barra del celular girada un cuarto de vuelta**, y eso es literal: la muesca sale de la
 * misma función que la de abajo (ver `notchGeometry.ts`), así que las dos tienen el mismo radio,
 * el mismo aire alrededor del círculo y los mismos labios redondeados. El ancho del riel es el
 * alto de la otra barra por el mismo motivo. Lo único que cambia es contra qué borde se apoya.
 *
 * El círculo y el hueco salen del MISMO número animado. `--active-index` lo anima el CSS —con la
 * curva de siempre— y de ahí salen los dos: el círculo lo lee en su `top` y el recorte se
 * redibuja leyendo ese mismo valor interpolado en cada cuadro. No hay dos animaciones que
 * sincronizar: hay una, y la otra es un espejo.
 *
 * **Es solo de íconos, y eso obliga a dos cosas.** Cada enlace lleva su `aria-label`, porque sin
 * texto un lector de pantalla anunciaría un enlace sin nombre; y cada uno muestra su rótulo al
 * pasar el mouse, porque un ícono solo no siempre se adivina. Lo segundo no reemplaza a lo
 * primero: el rótulo visible no existe para el teclado ni para el lector.
 */
export default function SideRail() {
  const { pathname } = useLocation()
  const activeIndex = MAIN_SECTIONS.findIndex((section) => isSectionActive(section, pathname))
  const hasActive = activeIndex >= 0
  const ActiveIcon = hasActive ? MAIN_SECTIONS[activeIndex].Icon : null

  const railRef = useRef<HTMLDivElement>(null)
  const shapeRef = useRef<HTMLDivElement>(null)

  /*
   * El espejo: sigue el valor que el CSS está interpolando y redibuja el recorte con él.
   *
   * Corre por `requestAnimationFrame` y **solo mientras dura el viaje**: la condición de corte es
   * que el valor leído haya llegado al destino. Si el navegador no soporta `@property`, la
   * variable no se interpola, el primer cuadro ya lee el destino y el bucle termina ahí mismo
   * —el hueco aparece puesto en su lugar, igual que el círculo, sin quedar girando de fondo—.
   */
  useEffect(() => {
    const rail = railRef.current
    const shape = shapeRef.current
    if (rail === null || shape === null) return

    /* Sin sección activa no hay muesca: el riel se dibuja entero. */
    if (!hasActive) {
      shape.style.clipPath = ''
      return
    }

    let frame = 0
    const draw = () => {
      const sampled = Number.parseFloat(getComputedStyle(rail).getPropertyValue('--active-index'))
      const index = Number.isNaN(sampled) ? activeIndex : sampled

      shape.style.clipPath = railClipPath(railItemCenter(index), MAIN_SECTIONS.length)

      /* Medio milésimo de sección: por debajo de eso no hay píxel que cambie. */
      if (Math.abs(index - activeIndex) > 0.0005) frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [activeIndex, hasActive])

  return (
    /*
      Flota sobre el contenido y está centrado verticalmente contra la ventana, no contra el
      contenido: es un elemento de la aplicación y no de la pantalla que se está mirando, así que
      tiene que quedarse quieto aunque abajo cambie todo.
    */
    <nav
      ref={railRef}
      aria-label="Navegación principal"
      className="side-rail fixed top-1/2 left-5 z-[1050] hidden -translate-y-1/2 md:block"
      style={
        {
          width: RAIL_WIDTH,
          height: railHeight(MAIN_SECTIONS.length),
          /*
            Las medidas salen de `notchGeometry.ts` y se le pasan al CSS como variables, en vez de
            estar escritas en los dos lados. El recorte y el círculo caen en el mismo lugar
            porque leen lo mismo.
          */
          '--active-index': activeIndex,
          '--puck-size': `${RAIL_PUCK_SIZE}px`,
          '--notch-lift': `${RAIL_NOTCH_LIFT}px`,
          '--rail-width': `${RAIL_WIDTH}px`,
          '--rail-pad-y': `${RAIL_GEOMETRY.paddingY}px`,
          '--rail-item': `${RAIL_GEOMETRY.itemSize}px`,
          '--rail-step': `${RAIL_STEP}px`,
        } as React.CSSProperties
      }
    >
      {/*
        El vidrio va en su propio elemento, debajo de los enlaces y no envolviéndolos: el
        `clip-path` que abre la muesca recorta TODO lo que hay dentro del elemento al que se le
        aplica, y si los íconos estuvieran adentro, al que está al lado del hueco le faltaría un
        pedazo.
      */}
      <div ref={shapeRef} className="side-rail__shape absolute inset-0" />

      <div
        className="relative flex flex-col"
        style={{
          gap: RAIL_GEOMETRY.gap,
          padding: `${RAIL_GEOMETRY.paddingY}px ${RAIL_GEOMETRY.paddingX}px`,
        }}
      >
        {MAIN_SECTIONS.map((section) => {
          const active = isSectionActive(section, pathname)
          return (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              aria-label={section.label}
              className="group relative flex items-center justify-center"
              style={{ height: RAIL_GEOMETRY.itemSize, width: RAIL_GEOMETRY.itemSize }}
            >
              {/*
                El ícono de la sección activa no se esconde con `display`: se apaga. El que se ve
                es el mismo dibujo dentro del círculo, y dejar que este ocupe su lugar mantiene
                la fila quieta mientras el círculo viaja.
              */}
              <section.Icon
                className={`h-5 w-5 transition-opacity duration-200 ${
                  active ? 'opacity-0' : 'text-text-muted group-hover:text-text opacity-100'
                }`}
              />

              {/*
                El rótulo al pasar el mouse. `aria-hidden` porque el nombre accesible ya lo da el
                `aria-label` del enlace: sin esto, el lector lo diría dos veces.

                Se corre lo suficiente como para no quedar debajo del círculo, que sobresale del
                riel. `pointer-events-none` para que el globo no se meta entre el mouse y el
                enlace —tocarlo cancelaría el hover y lo haría parpadear—.
              */}
              <span
                aria-hidden="true"
                className="glass-panel text-text pointer-events-none absolute left-full ml-14 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                {section.label}
              </span>
            </NavLink>
          )
        })}
      </div>

      {/*
        El círculo. Va afuera del elemento recortado: adentro lo cortaría el mismo `clip-path`
        que abre el hueco para él.

        `pointer-events-none` porque no es un botón: el que recibe el clic es el enlace que tiene
        debajo. Si el círculo lo capturara, tocar la sección activa no haría nada.
      */}
      {ActiveIcon !== null && (
        <div className="side-rail__puck bg-primary text-background pointer-events-none absolute flex items-center justify-center rounded-full">
          <ActiveIcon className="h-6 w-6" />
        </div>
      )}
    </nav>
  )
}
