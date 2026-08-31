import { Outlet } from 'react-router'

/**
 * Layout raíz de la aplicación: lo que se ve en todas las pantallas.
 *
 * El contenido de cada pantalla lo inyecta <Outlet /> según la ruta activa.
 * Las pantallas NO se agregan acá: cada feature declara sus rutas en su propio
 * archivo. Ver src/routes/routes.tsx.
 */
export default function App() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border bg-surface border-b px-6 py-4">
        <span className="text-primary text-lg font-semibold">Ecopedia</span>
      </header>

      {/*
        Columna flex, no un bloque suelto: así una pantalla que quiere ocupar todo el alto
        —el mapa de estaciones— crece como ítem del flex en vez de depender de un height
        en porcentaje, que acá no resuelve porque el contenedor de arriba tiene min-height
        y no una altura definida. Con h-full la pantalla colapsa al alto de su encabezado.
      */}
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  )
}
