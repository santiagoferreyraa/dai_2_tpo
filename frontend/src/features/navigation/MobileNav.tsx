import { useEffect, useId, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'

import { useSession } from '@/features/auth/session'

import { isSectionActive, MOBILE_SECTIONS, visibleSections } from './navSections'
import { NAV_GEOMETRY, notchCutPath, sectionCenter } from './notchGeometry'

/**
 * La barra de navegación del celular: flota abajo, con el círculo verde sobre la sección
 * activa y una muesca en la barra por donde el círculo asoma.
 *
 * **El círculo y la muesca siguen siendo una sola cosa que se mueve.** Es lo que hace que el
 * efecto se lea: si la muesca saltara y el círculo se deslizara, durante el viaje el círculo
 * caminaría sobre la barra llena y llegaría a un agujero que lo esperaba.
 *
 * Lo que los mantiene pegados es que los dos salen del MISMO número animado. `--active-index`
 * lo anima el CSS —con la curva de siempre, la de `BottomSheet` y el panel del mapa—, el
 * círculo lo lee directo en su `left`, y el `path` de la muesca se redibuja leyendo ese mismo
 * valor interpolado en cada cuadro. No hay dos animaciones que sincronizar: hay una, y la otra
 * es un espejo.
 *
 * **Por qué la barra ahora es un SVG y no un div con máscara.** La versión anterior abría el
 * hueco con un `radial-gradient`, que se anima solo y no necesita medir nada. Pero el
 * encuentro entre el círculo y el borde recto quedaba en punta, y los labios redondeados que
 * lo arreglan son arcos tangentes: no hay degradado que los describa. Ver `notchGeometry.ts`.
 *
 * El costo de ese cambio es tener que medir el ancho de la barra, porque un `path` se escribe
 * en píxeles. Lo hace un `ResizeObserver`, que es una sola suscripción y cubre todos los casos
 * —girar el teléfono, abrir el teclado, cambiar el zoom— sin escuchar `resize` a mano.
 */
export default function MobileNav() {
  const { pathname } = useLocation()
  const session = useSession()
  /*
    Solo las que le corresponden a quien mira. Acá el filtro pesa doble: de la CANTIDAD de
    secciones sale el ancho de cada una y, con él, dónde se para el círculo. Por eso todo lo que
    sigue cuenta sobre `sections` y no sobre la lista completa.
  */
  const sections = visibleSections(MOBILE_SECTIONS, session?.role ?? null)

  const activeIndex = sections.findIndex((section) => isSectionActive(section, pathname))

  /*
   * Una ruta que no es ninguna de las cinco —el detalle de una estación, mañana— no tiene
   * dónde parar el círculo. En vez de dejarlo en la sección equivocada, la barra se dibuja
   * lisa y sin círculo: no decir nada es mejor que mentir.
   */
  const hasActive = activeIndex >= 0
  const ActiveIcon = hasActive ? sections[activeIndex].Icon : null

  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const cutRef = useRef<SVGPathElement>(null)
  const [barWidth, setBarWidth] = useState(0)

  /* El `id` de la máscara tiene que ser único en el documento: `useId` lo garantiza. */
  const maskId = useId()

  useEffect(() => {
    const bar = barRef.current
    if (bar === null) return

    const observer = new ResizeObserver(([entry]) => {
      setBarWidth(entry.contentRect.width)
    })
    observer.observe(bar)
    return () => observer.disconnect()
  }, [])

  /*
   * El espejo: sigue el valor que el CSS está interpolando y redibuja el recorte con él.
   *
   * Corre por `requestAnimationFrame` y **solo mientras dura el viaje**: la condición de corte
   * es que el valor leído haya llegado al destino. Si el navegador no soporta `@property`, la
   * variable no se interpola, el primer cuadro ya lee el destino y el bucle termina ahí mismo
   * —la muesca aparece puesta en su lugar, igual que el círculo, sin animación y sin quedar
   * girando de fondo—.
   */
  useEffect(() => {
    const nav = navRef.current
    const cut = cutRef.current
    if (nav === null || cut === null || barWidth === 0) return

    let frame = 0
    const draw = () => {
      const sampled = Number.parseFloat(getComputedStyle(nav).getPropertyValue('--active-index'))
      const index = Number.isNaN(sampled) ? activeIndex : sampled

      cut.setAttribute('d', notchCutPath(sectionCenter(index, barWidth, sections.length)))

      /* Medio milésimo de sección: por debajo de eso no hay píxel que cambie. */
      if (Math.abs(index - activeIndex) > 0.0005) frame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frame)
  }, [activeIndex, barWidth, sections.length])

  const { barHeight, barRadius, trackInset } = NAV_GEOMETRY

  return (
    /*
      `md:hidden` y no un `useMediaQuery`: acá las dos barras pueden convivir en el DOM porque
      ninguna atrapa el foco ni bloquea el scroll —que es lo que sí obliga a decidir en
      JavaScript cuál se monta en el caso de los paneles—. Con CSS solo, además, no hay un
      primer cuadro con la barra equivocada.
    */
    <nav
      ref={navRef}
      aria-label="Navegación principal"
      className="mobile-nav pointer-events-none fixed inset-x-0 bottom-0 z-[1100] px-4 md:hidden"
      style={
        {
          /*
            Las medidas salen de `notchGeometry.ts` y se le pasan al CSS como variables, en vez
            de estar escritas en los dos lados. El `path` y el círculo caen en el mismo lugar
            porque leen lo mismo.
          */
          '--active-index': activeIndex,
          '--puck-size': `${NAV_GEOMETRY.puckSize}px`,
          '--notch-lift': `${NAV_GEOMETRY.notchLift}px`,
          '--track-inset': `${trackInset}px`,
          '--section-count': sections.length,
        } as React.CSSProperties
      }
    >
      {/*
        El aire de abajo lo pone `.mobile-nav` con `env(safe-area-inset-bottom)` y no con un
        número fijo: en los teléfonos con barra de gestos, un valor a ojo deja la navegación
        debajo de la franja del sistema, donde el dedo la toca pero el sistema se lo queda.
      */}
      <div ref={barRef} className="pointer-events-auto relative" style={{ height: barHeight }}>
        {/*
          La barra, dibujada como una figura y no como una caja con fondo.

          El hueco se saca con una máscara de SVG: un rectángulo blanco —lo que se ve— menos el
          recorte negro de la muesca. Tiene que ser un agujero de verdad porque la barra flota
          sobre el contenido: en la pantalla del mapa, lo que se ve por el hueco son los
          mosaicos, y un círculo pintado del color del fondo se notaría al instante.

          Mientras no se midió el ancho no se dibuja nada. Es un solo cuadro, y es preferible a
          mostrar la muesca en el lugar equivocado.
        */}
        {barWidth > 0 && (
          <svg
            className="mobile-nav__bar absolute inset-0"
            width={barWidth}
            height={barHeight}
            aria-hidden="true"
          >
            <defs>
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x={0}
                y={0}
                width={barWidth}
                height={barHeight}
              >
                <rect x={0} y={0} width={barWidth} height={barHeight} fill="#fff" />
                {hasActive && (
                  <path
                    ref={cutRef}
                    fill="#000"
                    d={notchCutPath(sectionCenter(activeIndex, barWidth, sections.length))}
                  />
                )}
              </mask>
            </defs>

            <rect
              x={0}
              y={0}
              width={barWidth}
              height={barHeight}
              rx={barRadius}
              fill="var(--color-surface)"
              mask={`url(#${maskId})`}
            />
          </svg>
        )}

        {/*
          Los enlaces van por encima del SVG. El padding horizontal es el mismo `trackInset`
          que usa la geometría: de él sale el centro de cada sección, así que si se separaran,
          el círculo dejaría de caer sobre su ícono.
        */}
        <div
          className="relative flex h-full items-stretch"
          style={{ paddingLeft: trackInset, paddingRight: trackInset }}
        >
          {sections.map((section, index) => {
            const active = index === activeIndex
            return (
              <NavLink
                key={section.to}
                to={section.to}
                end={section.end}
                className="flex flex-1 flex-col items-center justify-center gap-1"
              >
                {/*
                  El ícono de la sección activa no se esconde con `display`: se apaga. El que
                  se ve es el mismo dibujo dentro del círculo de arriba, y dejar que este ocupe
                  su lugar mantiene la etiqueta clavada donde está mientras el círculo viaja.
                  Sacándolo del flujo, los textos darían un saltito en cada cambio.
                */}
                <section.Icon
                  className={`h-5 w-5 transition-opacity duration-200 ${
                    active ? 'opacity-0' : 'text-text-muted opacity-100'
                  }`}
                />
                <span
                  className={`text-[10px] leading-none font-medium transition-colors duration-200 ${
                    active ? 'text-text font-semibold' : 'text-text-muted'
                  }`}
                >
                  {section.label}
                </span>
              </NavLink>
            )
          })}
        </div>

        {/*
          El círculo. Va afuera del SVG y no adentro: adentro lo recortaría la misma máscara
          que abre el hueco para él.

          `pointer-events-none` porque no es un botón: el que recibe el toque es el enlace de
          la barra que tiene debajo. Si el círculo capturara el toque, tocar la sección activa
          no haría nada.
        */}
        {ActiveIcon !== null && (
          <div className="mobile-nav__puck brand-fill text-on-primary pointer-events-none absolute flex items-center justify-center rounded-full">
            <ActiveIcon className="h-6 w-6" />
          </div>
        )}
      </div>
    </nav>
  )
}
