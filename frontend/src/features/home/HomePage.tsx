import { Link } from 'react-router'

import { BoltIcon, ClockIcon, LeafIcon, MapIcon } from '@/features/navigation/icons'

import BarSpark from './components/BarSpark'
import HomeCard from './components/HomeCard'
import RingGauge from './components/RingGauge'

/**
 * La pantalla de entrada.
 *
 * Es lo primero que ve alguien que llega sin saber qué es esto, así que su trabajo es uno solo:
 * decir qué resuelve la aplicación y mandar al mapa, que es donde empieza todo lo demás (RF07).
 * No lista estaciones ni pide datos al backend —para eso están las otras pantallas—, y por eso
 * se dibuja instantánea y no tiene estado de carga ni de error.
 *
 * **Lo que dicen las tarjetas es verificable o es una regla del sistema.** Un auto eléctrico no
 * tiene caño de escape, y eso no es una estimación; el porcentaje objetivo con corte automático
 * es RF12; los quince minutos de tolerancia y el cobro del consumo real son RF09 y RF14; los
 * tres tipos de conector son los de RF05. No hay ni un número inventado, y es a propósito: una
 * pantalla de inicio que promete cifras que el sistema no mide es lo primero que se cae cuando
 * alguien pregunta de dónde salen.
 *
 * **El hueco del centro en pantalla grande está dejado a propósito.** Ahí va la ilustración de
 * la estación de carga cuando exista; hasta entonces la composición se sostiene con aire, que es
 * preferible a estirar las tarjetas para tapar el lugar y tener que volver a acomodarlas después.
 */

/** Los tres conectores de RF05. Son un enum del dominio, no una lista de ejemplo. */
const CONNECTORS = ['CCS2', 'CHAdeMO', 'Tipo 2']

export default function HomePage() {
  return (
    /*
      `overflow-y-auto` acá adentro y no en el <body>: el layout raíz fija la altura en la
      ventana para que el mapa pueda medirla, así que la pantalla que sí tiene contenido largo
      scrollea por su cuenta.

      El par `-mt-20 pt-20` de escritorio parece que se cancela y no es así. El <main> reserva el
      alto de la franja superpuesta con un `padding`; el margen negativo estira ESTA pantalla
      hacia arriba hasta debajo de la franja, y el `padding` de acá le devuelve al contenido el
      lugar que perdió. El resultado es que el área que scrollea empieza arriba de todo: al bajar,
      el contenido pasa POR DEBAJO de la franja y el vidrio tiene algo que difuminar. Sin esto la
      franja translúcida solo difumina el fondo, que es lo mismo que pintarla de un color.

      Se hace acá y no en el <main> a propósito: en el <main> afectaría también al mapa y al ABM
      de estaciones, que son pantallas de otra rama y no tienen por qué enterarse.
    */
    <div className="relative flex-1 overflow-y-auto md:-mt-20 md:pt-20">
      {/* `pb-36` en el celular es el lugar de la barra flotante de navegación. */}
      <div className="mx-auto w-full max-w-6xl px-5 pt-8 pb-36 md:px-8 md:pt-10 md:pb-10">
        {/*
          La grilla de doce columnas es solo de `lg` para arriba, que es donde hay ancho para
          que las tarjetas floten a los costados del hueco central. Abajo de eso todo se apila
          en una columna: intentar sostener la composición en un ancho que no da termina en
          tarjetas de dos palabras por renglón.
        */}
        <div className="grid gap-5 lg:grid-cols-12">
          <section className="lg:col-span-6 lg:row-start-1">
            <span className="glass-panel text-text-muted inline-flex rounded-full px-3 py-1 text-xs font-medium">
              Buscá · Reservá · Cargá
            </span>

            <h1 className="text-text mt-6 text-5xl leading-[0.95] font-extrabold tracking-tight text-balance md:text-6xl lg:text-7xl">
              Cargá tu auto
              <br />
              <span className="text-primary">sin dar vueltas.</span>
            </h1>

            <p className="text-text-muted mt-6 max-w-md text-sm leading-relaxed text-pretty md:text-base">
              Ecopedia reúne las estaciones de carga rápida en un solo mapa. Mirás cuáles están
              libres, reservás el conector y pagás solo lo que cargaste.
            </p>

            {/*
              Dos acciones y una sola destacada. El mapa es por donde conviene entrar; el ABM de
              estaciones es para el operador, así que va en segundo plano. En el celular ocupan
              todo el ancho y se apilan: son el objetivo del pulgar.
            */}
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                to="/stations/map"
                className="bg-primary text-background hover:bg-primary-strong rounded-xl px-6 py-3 text-center text-sm font-semibold transition-colors"
              >
                Ver el mapa
              </Link>
              <Link
                to="/stations"
                className="glass-panel text-text hover:border-primary/60 rounded-xl px-6 py-3 text-center text-sm font-medium"
              >
                Explorar estaciones
              </Link>
            </div>
          </section>

          {/* Emisiones: el argumento ambiental, que es el que explica el nombre del proyecto. */}
          <HomeCard
            Icon={LeafIcon}
            label="Impacto ambiental"
            className="lg:col-span-4 lg:col-start-9 lg:row-start-1 lg:self-start"
            footer={[
              { label: 'Sin caño de escape', value: 'CO₂, NOx y hollín' },
              { label: 'Motor eléctrico', value: 'Mucho menos ruido' },
            ]}
          >
            <p className="text-text flex items-baseline gap-1 text-5xl font-extrabold tracking-tight">
              0<span className="text-2xl font-bold">g</span>
            </p>
            <p className="text-text-muted mt-1 text-xs">de CO₂ por kilómetro recorrido</p>

            <BarSpark className="text-primary mt-5 h-16 w-full" />
          </HomeCard>

          {/* Búsqueda: RF07, que es la pantalla a la que empuja toda la home. */}
          <HomeCard
            Icon={MapIcon}
            label="Encontrá el conector que te sirve"
            className="lg:col-span-4 lg:col-start-1 lg:row-start-2"
            footer={[
              { label: 'Filtrás por', value: 'Conector y potencia' },
              { label: 'Disponibilidad', value: 'En tiempo real' },
            ]}
          >
            <p className="text-text-muted text-sm leading-relaxed">
              No todos los autos cargan con la misma ficha. Elegís la tuya y el mapa te muestra solo
              las estaciones que te sirven.
            </p>

            <ul className="mt-4 flex flex-wrap gap-2">
              {CONNECTORS.map((connector) => (
                <li
                  key={connector}
                  className="border-border/70 text-text rounded-lg border px-2.5 py-1 text-xs font-semibold"
                >
                  {connector}
                </li>
              ))}
            </ul>
          </HomeCard>

          {/* Carga: RF12 y su corte automático, más las dos reglas que más preguntan. */}
          <HomeCard
            Icon={BoltIcon}
            label="Cargá hasta donde quieras"
            className="lg:col-span-4 lg:col-start-9 lg:row-start-2"
            footer={[
              { label: 'Tolerancia', value: '15 minutos' },
              { label: 'Se cobra', value: 'Lo consumido' },
            ]}
          >
            <div className="flex items-center gap-5">
              {/*
                El anillo es un ejemplo de la interfaz y no una medición: muestra cómo se ve un
                objetivo fijado en 80%, que es el valor que recomienda cualquier fabricante para
                el uso diario.
              */}
              <div className="text-primary relative h-24 w-24 shrink-0">
                <RingGauge value={80} className="h-full w-full" />
                <span className="text-text absolute inset-0 flex items-center justify-center text-xl font-extrabold">
                  80%
                </span>
              </div>

              <p className="text-text-muted text-sm leading-relaxed">
                Fijás el porcentaje al que querés llegar y la sesión se corta sola cuando lo
                alcanza.
              </p>
            </div>
          </HomeCard>

          {/*
            La franja de cierre: la última oportunidad de mandar al mapa, para quien scrolleó
            hasta abajo sin haber tocado el botón de arriba.
          */}
          <section className="glass-panel flex flex-col gap-5 rounded-3xl p-5 md:flex-row md:items-center md:gap-8 lg:col-span-12 lg:row-start-3">
            <div className="flex items-center gap-4">
              <span className="bg-primary/15 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                <ClockIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-text-muted text-xs font-medium">Una sola cuenta</p>
                <p className="text-text mt-1 text-sm font-semibold text-pretty">
                  Sin una aplicación distinta por cada operador de carga.
                </p>
              </div>
            </div>

            <p className="text-text-muted border-border/60 text-sm leading-relaxed text-pretty md:flex-1 md:border-l md:pl-8">
              Buscás en el mapa, reservás el conector por la ventana que necesitás y cargás. La seña
              de la reserva se descuenta de lo que termines consumiendo.
            </p>

            <Link
              to="/stations/map"
              className="bg-primary text-background hover:bg-primary-strong shrink-0 rounded-xl px-5 py-2.5 text-center text-sm font-semibold transition-colors"
            >
              Ver el mapa
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
