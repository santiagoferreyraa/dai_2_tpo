import { Link } from 'react-router'

import { BoltIcon, ClockIcon } from '@/features/navigation/icons'
import SearchBox from '@/features/navigation/SearchBox'

import NextChargeCard from './NextChargeCard'

import { SAMPLE_STATIONS } from '../sampleStations'

/**
 * La portada del celular.
 *
 * Es una pantalla distinta de la de escritorio, no la misma achicada: acá arriba de todo va el
 * saludo y el buscador —lo primero que alguien quiere hacer desde el teléfono es encontrar dónde
 * cargar—, y el argumento largo del producto queda para la pantalla grande, donde hay lugar para
 * leerlo.
 *
 * El buscador es el mismo que el de la barra de escritorio, y lleva lo que se escribe al mapa.
 * Ver `SearchBox`.
 */

/** Fondo del recuadro grande. Si el archivo no está, el recuadro se ve igual, solo que sin auto. */
const HERO_CAR_IMAGE = '/car.png'

/** El saludo, según la hora del aparato. */
function greetingFor(hour: number): string {
  if (hour < 12) return 'Buen día'
  if (hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function MobileHome() {
  return (
    <div className="flex flex-col gap-6 px-5 pt-8 pb-36">
      <header>
        <p className="text-text-muted text-sm">{greetingFor(new Date().getHours())} 👋</p>
        <h1 className="text-text mt-1 text-3xl leading-tight font-extrabold tracking-tight text-balance">
          ¿Dónde cargamos hoy?
        </h1>
      </header>

      <SearchBox />

      {/*
        El recuadro del auto. El auto va como fondo y no como <img>, y eso es lo que lo vuelve
        opcional: un fondo que no existe simplemente no se dibuja, mientras que una imagen rota
        deja el ícono gris del navegador en el medio de la portada. El alto mínimo está elegido
        para que el recuadro se vea entero con auto y sin auto, y el texto ocupa poco más de la
        mitad del ancho para dejarle sitio a la derecha.

        Va oscuro en los dos temas, igual que en el diseño de referencia: es el único bloque
        macizo de la portada y funciona como el ancla de la pantalla.
      */}
      <section
        className="relative flex min-h-52 flex-col justify-center overflow-hidden rounded-3xl bg-[#101725] p-5"
        style={{
          backgroundImage: `url("${HERO_CAR_IMAGE}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right -2rem bottom -1rem',
          backgroundSize: '78% auto',
        }}
      >
        <p className="text-xs font-medium text-white/60">Tu próxima carga</p>
        <p className="mt-1 max-w-[9rem] text-2xl leading-tight font-extrabold tracking-tight text-white">
          Llegá lejos.
          <br />
          Cargá tranquilo.
        </p>

        <Link
          to="/stations/map"
          className="brand-fill text-on-primary relative mt-5 inline-flex self-start rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          Ver el mapa
        </Link>
      </section>

      {/* Lo más accionable de la pantalla, apenas debajo del auto. Ver `NextChargeCard`. */}
      <NextChargeCard />

      {/*
        Dos datos, y ninguno del auto. El diseño de referencia muestra batería, autonomía y tiempo
        restante: son tres cosas que sabe el vehículo y que esta aplicación no mide. Estas dos sí
        las sostiene el sistema —los conectores de RF05 y la tolerancia de RF09—.
      */}
      <section className="grid grid-cols-2 gap-3">
        <article className="glass-panel rounded-2xl p-4">
          <span className="text-text-muted flex items-center gap-1.5 text-xs font-medium">
            <BoltIcon className="h-3.5 w-3.5" />
            Conectores
          </span>
          <p className="text-text mt-2 text-2xl font-extrabold tracking-tight">3 tipos</p>
          {/* Espacio duro en "Tipo 2": partido al final del renglón queda un "2" suelto abajo. */}
          <p className="text-text-muted mt-1 text-[11px]">CCS2 · CHAdeMO · Tipo 2</p>
        </article>

        <article className="glass-panel rounded-2xl p-4">
          <span className="text-text-muted flex items-center gap-1.5 text-xs font-medium">
            <ClockIcon className="h-3.5 w-3.5" />
            Tolerancia
          </span>
          <p className="text-text mt-2 text-2xl font-extrabold tracking-tight">15 min</p>
          <p className="text-text-muted mt-1 text-[11px]">desde que empieza tu turno</p>
        </article>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          {/*
            "Para empezar" y no "Cerca tuyo": no pedimos la ubicación en ningún lado, así que no
            hay con qué medir la cercanía. Ver `sampleStations.ts`.
          */}
          <h2 className="text-text text-base font-bold">Para empezar</h2>
          <Link to="/stations/map" className="text-primary text-xs font-semibold">
            Ver todas
          </Link>
        </div>

        <ul className="mt-3 flex flex-col gap-3">
          {SAMPLE_STATIONS.map((station) => (
            <li key={station.name}>
              <Link
                to="/stations/map"
                className="glass-panel hover:border-primary/60 flex items-center gap-3 rounded-2xl p-3.5 transition-colors"
              >
                <span className="bg-primary/15 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <BoltIcon className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="text-text block truncate text-sm font-semibold">
                    {station.name}
                  </span>
                  <span className="text-text-muted block truncate text-xs">{station.address}</span>
                </span>

                <span className="text-right">
                  <span className="text-text block text-sm font-bold">{station.powerKw} kW</span>
                  <span className="text-text-muted block text-[11px]">
                    {station.connectors.join(' · ')}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
