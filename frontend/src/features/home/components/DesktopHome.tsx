import { Link } from 'react-router'

import { MapIcon } from '@/features/navigation/icons'

import ActivityCard from './ActivityCard'
import NextChargeCard from './NextChargeCard'
import VehicleHero from './VehicleHero'

/**
 * La portada de escritorio y tablet.
 *
 * **Responde "¿cuándo y dónde cargo?", no "¿cómo es la red?".** Esa distinción es la que decidió
 * qué se fue: el reparto de conectores por tipo, la potencia máxima de la plataforma y el total de
 * conectores libres eran datos ciertos, pero de infraestructura. Al conductor no le resuelven nada
 * —su pregunta es dónde puede cargar ahora— y al operador sí, así que se mudaron a Estaciones, que
 * ya es su pantalla. Lo mismo con el bloque de emisiones: quedaba lindo y no aportaba a la tarea.
 *
 * Lo que queda son cuatro cosas y todas miran al conductor: su auto, su próxima carga, su
 * actividad y la puerta al mapa.
 *
 * **Dos de esas cuatro están vacías hoy, y con razón.** Las reservas y las sesiones de carga
 * dependen de servicios que todavía no existen, así que las tarjetas muestran su estado vacío, que
 * es verdadero, con el estado lleno ya escrito esperando los datos. Ver `data/nextCharge.ts` y
 * `data/chargingActivity.ts`.
 */
export default function DesktopHome() {
  return (
    /*
      Sin ancho máximo y con el MISMO `px-6` que la franja de arriba: así los recuadros arrancan y
      terminan exactamente donde el buscador y la ficha del perfil, y la pantalla se lee como una
      sola pieza en vez de una barra ancha con una columna angosta debajo.
    */
    <div className="flex w-full flex-col gap-5 px-6 pt-6 pb-10">
      {/*
        El auto y la próxima carga comparten la primera fila, y la actividad ocupa la segunda de
        lado a lado.

        La alternativa era apilar auto y actividad a la izquierda con la próxima carga alta al
        costado, y se veía peor: esa tarjeta hoy dice dos renglones, así que estirada a la altura
        de las otras dos quedaba con medio recuadro de aire. Emparejada solo con el auto, el aire
        que le sobra es el de una tarjeta y se lee como respiro.
      */}
      <div className="grid gap-5 xl:grid-cols-3">
        <VehicleHero className="xl:col-span-2" />
        <NextChargeCard />
      </div>

      <ActivityCard />

      {/* La franja de cierre: la última oportunidad de mandar al mapa. */}
      <section className="glass-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-center md:gap-8">
        <div className="flex items-center gap-4">
          <span className="bg-primary/15 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
            <MapIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-text-muted text-xs font-medium">Una sola cuenta</p>
            <p className="text-text mt-1 text-sm font-semibold text-pretty">
              Sin una aplicación distinta por cada operador de carga.
            </p>
          </div>
        </div>

        <p className="text-text-muted border-border/60 text-sm leading-relaxed text-pretty md:flex-1 md:border-l md:pl-8">
          Buscás en el mapa, reservás el conector por la ventana que necesitás y cargás. Se cobra lo
          que consumiste, con la seña ya descontada.
        </p>

        <Link
          to="/stations/map"
          className="bg-primary text-background hover:bg-primary-strong shrink-0 rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition-colors"
        >
          Ver el mapa
        </Link>
      </section>
    </div>
  )
}
