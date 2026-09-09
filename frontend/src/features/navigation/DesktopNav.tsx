import { Link, NavLink } from 'react-router'

import { MAIN_SECTIONS } from './navSections'
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
 */
export default function DesktopNav() {
  return (
    <header className="border-border bg-surface hidden shrink-0 border-b md:block">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-3">
        <Link to="/" className="text-primary justify-self-start text-lg font-semibold">
          Ecopedia
        </Link>

        <nav aria-label="Navegación principal" className="flex items-center gap-1">
          {MAIN_SECTIONS.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              end={section.end}
              /*
                El fondo del estado activo se dibuja siempre y se apaga con la opacidad, en vez
                de aparecer y desaparecer: así el color entra con una transición en lugar de un
                corte, y el ancho del enlace nunca cambia.
              */
              className={({ isActive }) =>
                `relative rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text'
                }`
              }
            >
              {section.label}
            </NavLink>
          ))}
        </nav>

        <div className="justify-self-end">
          <ProfilePill />
        </div>
      </div>
    </header>
  )
}
