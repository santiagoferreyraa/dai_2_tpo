import { NavLink, Outlet } from 'react-router'

/**
 * Layout raíz de la aplicación: lo que se ve en todas las pantallas.
 *
 * El contenido de cada pantalla lo inyecta <Outlet /> según la ruta activa.
 * Las pantallas NO se agregan acá: cada feature declara sus rutas en su propio
 * archivo. Ver src/routes/routes.tsx.
 */

/** Las dos vistas de Terminales, que son dos pantallas distintas sobre los mismos datos. */
const NAV_LINKS = [
  { to: '/stations', label: 'Estaciones' },
  { to: '/stations/map', label: 'Mapa' },
]

export default function App() {
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
      <header className="border-border bg-surface flex shrink-0 items-baseline gap-6 border-b px-6 py-4">
        <span className="text-primary text-lg font-semibold">Ecopedia</span>

        <nav className="flex gap-4 text-sm">
          {NAV_LINKS.map((link) => (
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
