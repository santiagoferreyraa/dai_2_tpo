import { Outlet } from 'react-router'

/**
 * Layout raíz de la aplicación: lo que se ve en todas las pantallas.
 *
 * El contenido de cada pantalla lo inyecta <Outlet /> según la ruta activa.
 * Las pantallas NO se agregan acá: cada feature declara sus rutas en su propio
 * archivo. Ver src/rutas/rutas.tsx.
 */
export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-borde bg-superficie border-b px-6 py-4">
        <span className="text-primario text-lg font-semibold">Ecopedia</span>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
