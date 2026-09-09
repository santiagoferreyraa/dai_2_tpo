import { NavLink, useLocation } from 'react-router'

import ThemeToggle from '@/features/theme/ThemeToggle'

import { isSectionActive, MAIN_SECTIONS } from './navSections'
import ProfilePill from './ProfilePill'
import SearchBox from './SearchBox'

/**
 * La barra de escritorio y tablet: buscador a la izquierda, secciones al medio, tema y perfil a la
 * derecha.
 *
 * Reemplaza al riel de íconos que había antes. La diferencia no es solo de lugar: el riel obligaba
 * a adivinar cada sección por su dibujo —de ahí los globos al pasar el mouse— y acá las secciones
 * dicen su nombre. Lo que se pierde es el ancho que ocupa la fila, y en pantalla grande sobra.
 *
 * **Es una grilla de tres columnas y no un `flex` con `justify-between`.** La diferencia importa:
 * con `flex`, el bloque del medio queda centrado entre los dos extremos, así que su posición
 * depende de cuánto mida el buscador y cuánto mida la ficha del usuario. Un nombre largo corre las
 * secciones. Con `grid-cols-[1fr_auto_1fr]` el centro está centrado **contra la ventana**, que es
 * lo que el ojo espera, y los costados crecen hacia afuera.
 *
 * Flota sobre el contenido y por eso es `fixed` y no una fila más del layout. `App.tsx` le reserva
 * el alto al `<main>` para que nada quede tapado.
 */
export default function TopBar() {
  const { pathname } = useLocation()

  return (
    <header className="fixed inset-x-0 top-0 z-[1050] hidden md:block">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-4">
        <SearchBox className="w-full max-w-xs justify-self-start" />

        <nav aria-label="Navegación principal" className="flex items-center gap-1">
          {MAIN_SECTIONS.map((section) => {
            const active = isSectionActive(section, pathname)
            return (
              <NavLink
                key={section.to}
                to={section.to}
                end={section.end}
                className={`relative rounded-lg px-3.5 py-2 text-sm transition-colors ${
                  active ? 'text-primary font-semibold' : 'text-text-muted hover:text-text'
                }`}
              >
                {section.label}

                {/*
                  El punto de la sección activa. Se dibuja siempre y se apaga con la opacidad, no
                  se monta y desmonta: así aparece con una transición en lugar de un corte, y el
                  ancho del enlace nunca cambia por su culpa.
                */}
                <span
                  aria-hidden="true"
                  className={`bg-primary absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-opacity duration-200 ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </NavLink>
            )
          })}
        </nav>

        <div className="flex items-center gap-3 justify-self-end">
          <ThemeToggle />
          <ProfilePill />
        </div>
      </div>
    </header>
  )
}
