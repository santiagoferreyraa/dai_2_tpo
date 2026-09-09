import { Link, NavLink, Outlet } from 'react-router'

import SessionMenu from '@/features/auth/components/SessionMenu'
import { useSession } from '@/features/auth/session'
import type { Role } from '@/features/auth/types'

/**
 * Layout raíz de la aplicación: lo que se ve en todas las pantallas.
 *
 * El contenido de cada pantalla lo inyecta <Outlet /> según la ruta activa.
 * Las pantallas NO se agregan acá: cada feature declara sus rutas en su propio
 * archivo. Ver src/routes/routes.tsx.
 */

/**
 * Las dos vistas de Terminales, que son dos pantallas distintas sobre los mismos datos.
 *
 * `roles` es la contracara del guard de esa ruta: el ABM exige rol de operador, así que
 * mostrarle el link a un conductor es ofrecerle un camino que termina en acceso denegado.
 * Un link que no se ve no es seguridad —quien escriba la URL a mano llega igual, y ahí lo
 * frena el guard, y al backend lo frena el `@PreAuthorize`—, es no prometer lo que no se
 * puede cumplir.
 */
const NAV_LINKS: { to: string; label: string; roles?: Role[] }[] = [
  { to: '/stations', label: 'Estaciones', roles: ['CPO'] },
  { to: '/stations/map', label: 'Mapa' },
]

export default function App() {
  const session = useSession()
  const visibleLinks = NAV_LINKS.filter(
    (link) => link.roles === undefined || (session !== null && link.roles.includes(session.role)),
  )

  return (
    /*
      `h-full` y no `min-h-full`: la altura tiene que quedar DEFINIDA, porque las pantallas
      de adentro piden `h-full` para medir la ventana y un porcentaje no resuelve contra un
      `min-height`. Con `min-h-full` el contenedor terminaba midiendo su contenido, así que
      la pantalla de estaciones crecía con el formulario abierto en vez de scrollear adentro.

      `min-h-0` en el <main> es la otra mitad: sin eso, un hijo que scrollea estira al padre
      en lugar de recortarse, porque la altura mínima por defecto de un ítem flex es su
      contenido.
    */
    <div className="flex h-full flex-col">
      <header className="border-border bg-surface flex shrink-0 items-center justify-between gap-6 border-b px-6 py-4">
        <div className="flex items-baseline gap-6">
          <Link className="text-primary text-lg font-semibold" to="/">
            Ecopedia
          </Link>

          <nav className="flex gap-4 text-sm">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                /*
                  `end` para que /stations no quede marcado mientras se mira /stations/map:
                  por omisión NavLink considera activo todo prefijo de la ruta actual.
                */
                end
                className={({ isActive }) =>
                  isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-primary'
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <SessionMenu />
      </header>

      {/*
        Columna flex, no un bloque suelto: así una pantalla que quiere ocupar todo el alto
        —el mapa de estaciones— crece como ítem del flex en vez de medir su contenido. El
        ABM no lo necesita, pero tampoco le molesta: sigue scrolleando adentro.
      */}
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
