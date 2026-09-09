import { Link } from 'react-router'

import { BoltIcon, MapIcon, StationsIcon } from '@/features/navigation/icons'

/**
 * La pantalla de entrada.
 *
 * Es lo primero que ve alguien que llega sin saber qué es esto, así que su trabajo es uno
 * solo: decir qué resuelve la aplicación y mandar al mapa, que es donde empieza todo lo demás
 * (RF07). No lista estaciones ni pide datos al backend —para eso están las otras pantallas—,
 * y por eso se dibuja instantánea y no tiene estado de carga ni de error.
 *
 * Los tres pasos de abajo no son decoración: son el recorrido real del conductor tal como lo
 * describen los requerimientos —buscar (RF07), reservar con seña (RF08) y cargar pagando el
 * consumo al final (RF11, RF14)—. Que estén acá es lo que explica por qué la aplicación pide
 * una tarjeta antes de dejar operar.
 */

interface Step {
  Icon: (props: { className?: string }) => React.ReactElement
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    Icon: MapIcon,
    title: 'Encontrá dónde cargar',
    body: 'Buscá en el mapa por cercanía, tipo de conector y potencia, y mirá qué está libre ahora.',
  },
  {
    Icon: StationsIcon,
    title: 'Reservá tu turno',
    body: 'Bloqueá un conector por la ventana que necesitás. La seña se descuenta de lo que cargues.',
  },
  {
    Icon: BoltIcon,
    title: 'Cargá y listo',
    body: 'Escaneás el código, elegís hasta qué porcentaje y el sistema corta solo. Se cobra lo consumido.',
  },
]

export default function HomePage() {
  return (
    /*
      `overflow-y-auto` acá adentro y no en el <body>: el layout raíz fija la altura en la
      ventana para que el mapa pueda medirla, así que la pantalla que sí tiene contenido largo
      scrollea por su cuenta. `pb-36` en el celular es el lugar de la barra flotante.

      El par `-mt-16 pt-16` de escritorio parece que se cancela y no es así. El <main> reserva
      el alto de la barra superpuesta con un `padding`; el margen negativo estira ESTA pantalla
      hacia arriba hasta debajo de la barra, y el `padding` de acá le devuelve al contenido el
      lugar que perdió. El resultado es que el área que scrollea empieza arriba de todo: al
      bajar, el contenido pasa POR DEBAJO de la barra y el vidrio tiene algo que difuminar.
      Sin esto la barra translúcida solo difumina el fondo liso, que es lo mismo que pintarla
      de un color.

      Se hace acá y no en el <main> a propósito: en el <main> afectaría también al mapa y al
      ABM de estaciones, que son pantallas de otra rama y no tienen por qué enterarse.
    */
    <div className="relative flex-1 overflow-y-auto md:-mt-16 md:pt-16">
      {/*
        Un resplandor verde detrás del título, tenue y muy grande. Es lo único que rompe el
        gris plano del tema oscuro en toda la pantalla.

        `pointer-events-none` porque es puramente decorativo: sin eso, se comería los clics de
        los botones que tiene encima.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_srgb,var(--color-primary)_14%,transparent),transparent)]"
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 pt-16 pb-36 md:pt-24 md:pb-20">
        <section className="flex flex-col items-center text-center">
          <span className="border-border text-text-muted rounded-full border px-3 py-1 text-xs">
            Carga rápida para vehículos eléctricos
          </span>

          <h1 className="text-text mt-6 text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Cargá tu auto <span className="text-primary">sin dar vueltas</span>
          </h1>

          <p className="text-text-muted mt-5 max-w-xl text-base text-pretty md:text-lg">
            Ecopedia reúne las estaciones de carga rápida en un solo mapa: mirás cuáles están
            libres, reservás el conector y pagás lo que cargaste.
          </p>

          {/*
            Dos acciones y una sola destacada. El mapa es lo que la aplicación hace mejor y por
            dónde conviene entrar; el ABM es para el operador, así que va en segundo plano.

            En el celular ocupan todo el ancho y se apilan: son el objetivo del pulgar.
          */}
          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              to="/stations/map"
              className="bg-primary text-background hover:bg-primary-strong rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
            >
              Ver el mapa
            </Link>
            <Link
              to="/stations"
              className="border-border text-text hover:bg-surface rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
            >
              Explorar estaciones
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-4 md:mt-28 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <article
              key={step.title}
              className="border-border bg-surface hover:border-primary/50 flex flex-col rounded-2xl border p-6 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="bg-background text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                  <step.Icon className="h-5 w-5" />
                </span>
                {/* El número ordena la lectura: son tres pasos en secuencia, no tres opciones. */}
                <span className="text-text-muted text-xs font-semibold">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              <h2 className="text-text mt-5 text-base font-semibold">{step.title}</h2>
              <p className="text-text-muted mt-2 text-sm leading-relaxed">{step.body}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
