import { Outlet } from 'react-router'

import Navbar from '@/features/navigation/Navbar'

/**
 * Layout raíz de la aplicación: lo que se ve en todas las pantallas.
 *
 * El contenido de cada pantalla lo inyecta <Outlet /> según la ruta activa.
 * Las pantallas NO se agregan acá: cada feature declara sus rutas en su propio
 * archivo. Ver src/routes/routes.tsx.
 *
 * La navegación tampoco se escribe acá. Son dos barras distintas —arriba en escritorio,
 * flotando abajo en el celular— y viven en `features/navigation`: este archivo monta una
 * línea y no sabe cuántas secciones hay ni cuál está activa.
 */
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
    <div className="relative flex h-full flex-col">
      {/*
        Las dos barras están FUERA del flujo, y por eso este contenedor es `relative`.

        La del celular va fija abajo: el <main> sigue midiendo la ventana entera, que es lo que
        deja al mapa llegar hasta el borde de abajo y verse por el hueco de la barra en vez de
        terminar cortado contra ella.

        La de escritorio va superpuesta arriba, y el `pt` del <main> le devuelve el alto que le
        sacó. Parece dar lo mismo que dejarla en el flujo, pero no: superpuesta, el contenido
        que scrollea le pasa por debajo, y eso es lo que hace que el vidrio tenga algo que
        difuminar. En el flujo, `backdrop-blur` solo difumina el fondo liso de la página.
      */}
      <Navbar />

      {/*
        Columna flex, no un bloque suelto: así una pantalla que quiere ocupar todo el alto
        —el mapa de estaciones— crece como ítem del flex en vez de medir su contenido. El
        ABM no lo necesita, pero tampoco le molesta: sigue scrolleando adentro.
      */}
      <main className="flex min-h-0 flex-1 flex-col md:pt-16">
        <Outlet />
      </main>
    </div>
  )
}
