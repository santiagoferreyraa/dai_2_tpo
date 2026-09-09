import { NavLink, useLocation } from 'react-router'

import { MOBILE_SECTIONS, type NavSection } from './navSections'

/**
 * La barra de navegación del celular: flota abajo, con el círculo verde sobre la sección
 * activa y una muesca en la barra por donde el círculo asoma.
 *
 * **El círculo y la muesca son una sola cosa que se mueve.** Es lo que hace que el efecto se
 * lea: si la muesca saltara y el círculo se deslizara, durante el viaje el círculo caminaría
 * sobre la barra llena y llegaría a un agujero que lo esperaba. Por eso los dos se posicionan
 * con la **misma** variable, `--notch-x`, y la animación se declara **una sola vez sobre
 * ella** (ver `index.css`): no hay dos transiciones que sincronizar porque no hay dos.
 *
 * Acá adentro no hay ni un cálculo de píxeles ni una medición del DOM. Las cinco secciones
 * reparten el ancho en partes iguales, así que el centro de la enésima es
 * `(i + 0.5) / 5` del ancho —de ahí el `(index * 2 + 1) * 10%`—, y el porcentaje lo resuelve
 * el navegador contra el ancho real, sea el que sea. Sin `ResizeObserver` y sin números que
 * se desactualicen cuando cambie el diseño.
 */

/**
 * Si la sección está activa, con la misma regla que aplica `NavLink`.
 *
 * Se repite acá porque el estado activo de `NavLink` vive adentro de cada enlace y el círculo
 * lo necesita **afuera**: para saber a qué altura pararse hay que conocer el índice antes de
 * dibujar la lista, no durante.
 */
function matches(section: NavSection, pathname: string): boolean {
  if (section.end === true) return pathname === section.to
  return pathname === section.to || pathname.startsWith(`${section.to}/`)
}

export default function MobileNav() {
  const { pathname } = useLocation()
  const activeIndex = MOBILE_SECTIONS.findIndex((section) => matches(section, pathname))

  /*
   * Una ruta que no es ninguna de las cinco —el detalle de una estación, mañana— no tiene
   * dónde parar el círculo. En vez de dejarlo en la sección equivocada, la barra se dibuja
   * lisa y sin círculo: no decir nada es mejor que mentir.
   */
  const hasActive = activeIndex >= 0
  const ActiveIcon = hasActive ? MOBILE_SECTIONS[activeIndex].Icon : null

  return (
    /*
      `md:hidden` y no un `useMediaQuery`: acá las dos barras pueden convivir en el DOM porque
      ninguna atrapa el foco ni bloquea el scroll —que es lo que sí obliga a decidir en
      JavaScript cuál se monta en el caso de los paneles—. Con CSS solo, además, no hay un
      primer cuadro con la barra equivocada.

      `pt-10` es el lugar del círculo, que sobresale 40px por arriba de la barra.
    */
    <nav
      aria-label="Navegación principal"
      className="mobile-nav pointer-events-none fixed inset-x-0 bottom-0 z-[1100] px-4 pt-10 md:hidden"
      style={
        {
          /*
            Lo único que sale de React: qué sección está activa. Dónde queda su centro y cómo
            se llega hasta ahí lo resuelve el CSS (ver `.mobile-nav` en index.css).
          */
          '--active-index': activeIndex,
        } as React.CSSProperties
      }
      data-active={hasActive ? 'true' : 'false'}
    >
      {/*
        El aire de abajo lo pone `.mobile-nav` con `env(safe-area-inset-bottom)` y no con un
        número fijo: en los teléfonos con barra de gestos, un valor a ojo deja la navegación
        debajo de la franja del sistema, donde el dedo la toca pero el sistema se lo queda.
      */}
      <div className="pointer-events-auto relative">
        {/*
          La barra. El agujero por donde asoma el círculo es una máscara y no un dibujo: tiene
          que ser un hueco de verdad porque abajo hay contenido —el mapa, sin ir más lejos—, y
          un círculo pintado del color del fondo se notaría apenas la barra deje de estar sobre
          un color liso.
        */}
        {/* `px-3` es el margen del carril: tiene que coincidir con `--track-inset`. */}
        <div className="mobile-nav__bar bg-surface flex h-16 items-stretch rounded-[28px] px-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
          {MOBILE_SECTIONS.map((section, index) => {
            const active = index === activeIndex
            return (
              <NavLink
                key={section.to}
                to={section.to}
                end={section.end}
                className="group relative flex flex-1 flex-col items-center justify-center gap-1"
              >
                {/*
                  El ícono de la sección activa no se esconde con `display`: se apaga. El que
                  se ve es el mismo dibujo dentro del círculo de arriba, y dejar que este
                  ocupe su lugar mantiene la etiqueta clavada donde está mientras el círculo
                  viaja. Sacándolo del flujo, los textos darían un saltito en cada cambio.
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
          El círculo. Va afuera de la barra y no adentro: adentro lo recortaría la máscara que
          justamente abre el hueco para él.

          `pointer-events-none` porque no es un botón: el que recibe el toque es el enlace de
          la barra que tiene debajo. Si el círculo capturara el toque, tocar la sección activa
          no haría nada.
        */}
        {ActiveIcon !== null && (
          <div className="mobile-nav__puck bg-primary text-background pointer-events-none absolute flex items-center justify-center rounded-full">
            <ActiveIcon className="h-6 w-6" />
          </div>
        )}
      </div>
    </nav>
  )
}
