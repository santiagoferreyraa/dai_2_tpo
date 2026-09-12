import { Link } from 'react-router'

import { useSession } from '@/features/auth/session'
import { ChevronRightIcon } from '@/features/navigation/icons'

import { visibleProfileSections } from '../sections'
import ProfileExit from './ProfileExit'

/**
 * Las secciones del perfil en el celular: una lista de renglones, debajo de la cabecera.
 *
 * **Es una lista y no la cinta que había antes.** Cada renglón es un blanco del ancho del teléfono
 * con el ícono y el nombre entero en una sola línea, que es lo que se toca con el pulgar sin
 * apuntar. Tocar uno lleva a la ruta de la sección, y ahí la lista deja lugar al recuadro de esa
 * sección —ver `ProfileLayout`—, así que el botón de atrás del teléfono vuelve a la lista.
 *
 * Son las mismas secciones que el riel de escritorio, leídas de `sections.tsx`, con el mismo aviso
 * sobre el ícono cuando lo hay (el punto de la reserva activa).
 */
export default function ProfileSectionList() {
  const sections = visibleProfileSections(useSession()?.role ?? null)

  return (
    <nav aria-labelledby="profile-sections-title" className="flex flex-col gap-3 md:hidden">
      <h2
        id="profile-sections-title"
        className="text-text text-xl font-extrabold tracking-tight uppercase"
      >
        Ajustes
      </h2>

      <ul className="flex flex-col gap-3">
        {sections.map((section) => (
          <li key={section.to}>
            <Link
              to={section.to}
              /*
                El mismo vidrio y el mismo radio que el recuadro que aparece al abrir la sección
                (`ProfileCard`): el renglón y lo que abre se leen como la misma pieza.
              */
              className="glass-panel text-text flex min-h-17 items-center gap-4 rounded-3xl px-3 py-3 transition-transform active:scale-[0.99]"
            >
              <span className="text-primary relative ml-2 flex shrink-0 items-center justify-center">
                <section.Icon className="h-6 w-6" />
                {section.Badge && <section.Badge />}
              </span>
              {/* Una sola línea, siempre: si un nombre no entra, se corta en vez de partirse. */}
              <span className="min-w-0 flex-1 truncate text-base font-extrabold tracking-tight uppercase">
                {section.label}
              </span>
              <ChevronRightIcon className="text-text-muted h-4 w-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>

      <ProfileExit variant="row" />
    </nav>
  )
}
