import { Link } from 'react-router'

import ThemeToggle from '@/features/theme/ThemeToggle'

import ProfilePill from './ProfilePill'

/**
 * La franja de arriba en escritorio y tablet: la marca a la izquierda, el tema y el perfil a la
 * derecha.
 *
 * **No lleva navegación.** Las secciones viven en el riel de la izquierda (`SideRail`), y acá
 * solo queda lo que no es navegar: quién sos y cómo se ve la aplicación. Separarlo así es lo que
 * deja el centro libre para el contenido, que es de lo que vive esta pantalla.
 *
 * Flota sobre el contenido, igual que el riel, y por eso es `fixed` y no una fila más del layout.
 * `App.tsx` le reserva el alto al `<main>` para que nada quede tapado.
 */
export default function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-[1050] hidden md:block">
      <div className="flex items-center justify-between gap-6 px-6 py-4">
        {/*
          Solo la marca, sin el nombre al lado: el logo ya dice de qué aplicación se trata, y el
          texto repetía lo que la pestaña del navegador muestra igual.

          El `aria-label` es lo que le da nombre al enlace. Sin él quedaría un enlace vacío para
          un lector de pantalla, porque adentro no hay texto —el dibujo lo pinta el CSS—.
        */}
        <Link to="/" aria-label="Ecopedia, ir al inicio" className="flex items-center">
          <span className="brand-mark bg-primary h-11 w-11" />
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ProfilePill />
        </div>
      </div>
    </header>
  )
}
