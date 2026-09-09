import { Link } from 'react-router'

import { BoltIcon, ClockIcon, LeafIcon, MapIcon } from '@/features/navigation/icons'

import BarChart from './BarChart'
import DonutChart from './DonutChart'
import HomeCard from './HomeCard'
import VehicleHero from './VehicleHero'
import { useNetworkStats } from '../useNetworkStats'

/**
 * La portada de escritorio y tablet.
 *
 * Es una grilla de recuadros: arriba a la izquierda el vehículo, a la derecha una columna con los
 * números de la red, debajo tres tarjetas y al pie una franja ancha. La disposición sale del
 * boceto; el reparto de qué va en cada una, de qué se puede sostener.
 *
 * **Cuatro de las seis tarjetas muestran datos calculados de verdad**, contando las estaciones que
 * devuelve el backend (ver `data/networkStats.ts`). Las otras dos dicen reglas del sistema —los
 * quince minutos de RF09, el cobro del consumo de RF14, el cero de emisiones de un auto sin caño
 * de escape—. No hay ningún número escrito a mano, salvo la ficha del vehículo, que es de catálogo
 * y está marcada como provisoria en su propio archivo.
 *
 * **Lo que NO hay es telemetría del auto**, aunque la referencia de diseño esté llena: batería
 * actual, autonomía restante, presión de neumáticos y temperaturas son lecturas del vehículo, y
 * esta aplicación no habla con ningún vehículo. Ver `vehicle.ts`.
 */

/**
 * Un color por tipo de conector.
 *
 * El primero sale del tema, así que acompaña el cambio de claro a oscuro. Los otros dos son fijos
 * y están elegidos para leerse sobre las dos superficies: son de la misma familia que los
 * resplandores del fondo, así que el gráfico no aparece como una isla de color ajeno.
 */
const SEGMENT_COLORS = ['var(--color-primary)', '#8b7bf0', '#3fb8c9']

/** Lo que se muestra donde iría un número que todavía no llegó. */
const NO_DATA = '—'

export default function DesktopHome() {
  const stats = useNetworkStats()

  return (
    /*
      Sin ancho máximo y con el MISMO `px-6` que la franja de arriba: así los recuadros arrancan y
      terminan exactamente donde el buscador y la ficha del perfil, y la pantalla se lee como una
      sola pieza en vez de una barra ancha con una columna angosta debajo.
    */
    <div className="flex w-full flex-col gap-5 px-6 pt-6 pb-10">
      <div className="grid gap-5 xl:grid-cols-3">
        {/* La columna ancha: el vehículo y, debajo, las tres tarjetas del boceto. */}
        <div className="flex flex-col gap-5 xl:col-span-2">
          <VehicleHero />

          <div className="grid gap-5 sm:grid-cols-3">
            <HomeCard Icon={BoltIcon} label="Potencia disponible">
              {stats === null ? (
                <p className="text-text-muted text-sm">{NO_DATA}</p>
              ) : (
                <>
                  <p className="text-text text-3xl font-extrabold tracking-tight">
                    {stats.maxPowerKw} kW
                  </p>
                  <p className="text-text-muted mt-1 text-xs">la más alta de la red</p>
                  {/*
                    Las barras cuentan conectores por tramo de potencia, no estaciones: una
                    estación con un cargador lento y uno rápido pesa en los dos tramos, que es lo
                    que le importa a alguien buscando dónde cargar.
                  */}
                  <BarChart
                    bars={stats.powerBuckets.map((bucket) => ({
                      label: bucket.label,
                      value: bucket.count,
                    }))}
                    className="mt-5"
                  />
                </>
              )}
            </HomeCard>

            <HomeCard
              Icon={ClockIcon}
              label="Reservá tu turno"
              footer={[
                { label: 'Tolerancia', value: '15 minutos' },
                { label: 'Se cobra', value: 'Lo consumido' },
              ]}
            >
              <p className="text-text-muted text-sm leading-relaxed">
                Bloqueás el conector por la ventana que necesitás. La seña se descuenta de lo que
                termines cargando.
              </p>
            </HomeCard>

            <HomeCard
              Icon={LeafIcon}
              label="Impacto ambiental"
              footer={[
                { label: 'Sin caño de escape', value: 'CO₂, NOx y hollín' },
                { label: 'Motor eléctrico', value: 'Mucho menos ruido' },
              ]}
            >
              <p className="text-text flex items-baseline gap-1 text-4xl font-extrabold tracking-tight">
                0<span className="text-xl font-bold">g</span>
              </p>
              <p className="text-text-muted mt-1 text-xs">de CO₂ por kilómetro recorrido</p>
            </HomeCard>
          </div>
        </div>

        {/* La columna angosta: los dos recuadros de la derecha del boceto. */}
        <div className="flex flex-col gap-5">
          <HomeCard Icon={MapIcon} label="Conectores de la red" className="flex-1">
            {stats === null ? (
              <p className="text-text-muted text-sm">{NO_DATA}</p>
            ) : (
              <div className="flex flex-1 flex-col justify-center gap-5">
                <div className="text-text-muted relative mx-auto h-36 w-36">
                  <DonutChart
                    className="h-full w-full"
                    segments={stats.connectorShare.map((share, index) => ({
                      label: share.label,
                      value: share.count,
                      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
                    }))}
                  />
                  <span className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-text text-2xl font-extrabold tracking-tight">
                      {stats.connectorCount}
                    </span>
                    <span className="text-text-muted text-[11px]">conectores</span>
                  </span>
                </div>

                {/*
                  La lista no es una leyenda decorativa: es la versión leíble del gráfico. Un
                  lector de pantalla salta el dibujo —está `aria-hidden`— y lee esto.
                */}
                <ul className="flex flex-col gap-2">
                  {stats.connectorShare.map((share, index) => (
                    <li key={share.type} className="flex items-center gap-2 text-xs">
                      <span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: SEGMENT_COLORS[index % SEGMENT_COLORS.length] }}
                      />
                      <span className="text-text-muted flex-1">{share.label}</span>
                      <span className="text-text font-bold">{share.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </HomeCard>

          <HomeCard Icon={BoltIcon} label="Ahora mismo">
            {stats === null ? (
              <p className="text-text-muted text-sm">{NO_DATA}</p>
            ) : (
              <>
                <p className="text-text text-4xl font-extrabold tracking-tight">
                  {stats.availableCount}
                  <span className="text-text-muted text-xl font-bold">/{stats.connectorCount}</span>
                </p>
                <p className="text-text-muted mt-1 text-xs">conectores libres en este momento</p>

                <p className="text-text-muted mt-4 text-xs">
                  Repartidos en{' '}
                  <span className="text-text font-bold">{stats.stationCount} estaciones</span>.
                </p>
              </>
            )}
          </HomeCard>
        </div>
      </div>

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
