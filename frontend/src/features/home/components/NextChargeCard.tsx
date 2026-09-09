import { Link } from 'react-router'

import { BoltIcon, ClockIcon } from '@/features/navigation/icons'

import { useNextCharge, type ActiveCharge, type ReservedCharge } from '../data/nextCharge'

/**
 * La tarjeta que responde "¿cuándo cargo?".
 *
 * Es la más importante de la portada porque es la única que cambia según lo que le está pasando al
 * conductor. Tiene tres caras, y son tres pantallas distintas y no la misma con otro texto:
 *
 * - **Sin nada**: la invitación a buscar. Es lo que se ve hoy siempre, y es cierto: no se pueden
 *   crear reservas todavía. Ver `data/nextCharge.ts`.
 * - **Con reserva**: cuándo, dónde y con qué conector, más cuánto falta.
 * - **Cargando**: a qué porcentaje va, cuál es el objetivo y cuánto lleva entregado.
 *
 * Las tres están escritas aunque hoy solo se vea una. Es a propósito: el día que `BookingService`
 * y `ChargingSessionService` entren, esta tarjeta no se toca.
 */

/** Cuánto falta para un instante, en palabras. Devuelve `null` si ya pasó. */
function timeUntil(moment: Date): string | null {
  const minutes = Math.round((moment.getTime() - Date.now()) / 60000)
  if (minutes <= 0) return null
  if (minutes < 60) return `en ${minutes} min`

  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `en ${hours} h` : `en ${hours} h ${rest} min`
}

/** La hora sola, sin fecha: la tarjeta ya dice de qué día habla. */
const HOUR = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' })

function ReservedBody({ charge }: { charge: ReservedCharge }) {
  const countdown = timeUntil(charge.from)

  return (
    <>
      <p className="text-text text-3xl font-extrabold tracking-tight">
        {HOUR.format(charge.from)}
        <span className="text-text-muted text-xl font-bold"> – {HOUR.format(charge.to)}</span>
      </p>
      <p className="text-text-muted mt-1 text-sm">
        {charge.stationName} · {charge.connectorLabel}
      </p>

      {/* La cuenta regresiva solo mientras falte: vencida, la ventana ya está corriendo. */}
      {countdown !== null && (
        <p className="text-primary mt-4 text-sm font-semibold">Empieza {countdown}</p>
      )}
    </>
  )
}

function ChargingBody({ charge }: { charge: ActiveCharge }) {
  return (
    <>
      <p className="text-text text-3xl font-extrabold tracking-tight">
        {charge.batteryPercent}%
        <span className="text-text-muted text-xl font-bold"> → {charge.targetPercent}%</span>
      </p>
      <p className="text-text-muted mt-1 text-sm">{charge.stationName}</p>

      {/*
        La barra usa el objetivo como tope y no el 100%: lo que el conductor está esperando es
        llegar al porcentaje que fijó, así que ese es el final del recorrido (RF12).
      */}
      <div className="bg-text-muted/20 mt-4 h-2 overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${Math.min(100, (charge.batteryPercent / charge.targetPercent) * 100)}%`,
          }}
        />
      </div>

      <p className="text-text-muted mt-3 text-sm">
        <span className="text-text font-bold">{charge.deliveredKWh} kWh</span> entregados ·{' '}
        <span className="text-text font-bold">{charge.powerKw} kW</span>
      </p>
    </>
  )
}

export default function NextChargeCard({ className = '' }: { className?: string }) {
  const charge = useNextCharge()

  const heading =
    charge.kind === 'charging'
      ? 'Carga en curso'
      : charge.kind === 'reserved'
        ? 'Tu próxima carga'
        : '¿Cuándo querés cargar?'

  return (
    <article className={`glass-panel flex flex-col rounded-3xl p-6 ${className}`}>
      <header className="text-text-muted flex items-center gap-2 text-xs font-medium">
        {charge.kind === 'charging' ? (
          <BoltIcon className="h-4 w-4" />
        ) : (
          <ClockIcon className="h-4 w-4" />
        )}
        {heading}
      </header>

      <div className="mt-4 flex flex-1 flex-col">
        {charge.kind === 'none' && (
          <>
            <p className="text-text-muted flex-1 text-sm leading-relaxed">
              Todavía no tenés una reserva. Buscá un conector que te sirva y bloqueá la ventana que
              necesités: al llegar, el cargador te está esperando.
            </p>
            <Link
              to="/stations/map"
              className="bg-primary text-background hover:bg-primary-strong mt-5 inline-flex self-start rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Buscar estación
            </Link>
          </>
        )}

        {charge.kind === 'reserved' && (
          <>
            <div className="flex-1">
              <ReservedBody charge={charge} />
            </div>
            <Link
              to="/stations/map"
              className="glass-panel text-text hover:border-primary/60 mt-5 inline-flex self-start rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Ver reserva
            </Link>
          </>
        )}

        {charge.kind === 'charging' && (
          <>
            <div className="flex-1">
              <ChargingBody charge={charge} />
            </div>
            <Link
              to="/stations/map"
              className="glass-panel text-text hover:border-primary/60 mt-5 inline-flex self-start rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              Ver carga
            </Link>
          </>
        )}
      </div>
    </article>
  )
}
