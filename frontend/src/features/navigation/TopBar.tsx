import { Link } from 'react-router'

import ThemeToggle from '@/features/theme/ThemeToggle'

import Logo from './Logo'
import ProfilePill from './ProfilePill'

/**
 * La franja de arriba en escritorio y tablet: la marca a la izquierda, el tema y el perfil a la
 * derecha.
 *
 * **No lleva navegación.** Las secciones viven en el riel de la izquierda (`SideRail`), y acá
 * solo queda lo que no es navegar: quién sos y cómo se ve la aplicación. Separarlo así es lo
 * que deja el centro libre para el contenido, que es de lo que vive esta pantalla.
 *
 * Flota sobre el contenido, igual que el riel, y por eso es `fixed` y no una fila más del
 * layout. `App.tsx` le reserva el alto al `<main>` para que nada quede tapado.
 */
export default function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-[1050] hidden md:block">
      <div className="flex items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <span className="glass-panel text-primary flex h-10 w-10 items-center justify-center rounded-xl">
            <Logo className="h-6 w-6" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-text text-base font-bold tracking-tight">Ecopedia</span>
            {/*
              El subtítulo dice de qué se trata sin obligar a entrar. Es la única línea de la
              barra que explica algo, y por eso puede permitirse ser chica.
            */}
            <span className="text-text-muted text-[11px]">Red de carga para autos eléctricos</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfilePill />
        </div>
      </div>
    </header>
  )
}
