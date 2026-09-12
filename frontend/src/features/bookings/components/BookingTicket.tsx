import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { CONNECTOR_TYPE_LABEL, formatPower } from '@/features/terminals/format'

import { formatCompactCountdown } from '../slots'
import type { Booking } from '../types'
import BookingBubble from './BookingBubble'
import { FLOAT_ABOVE_PX, useFloatingTicket } from './floatingTicket'

/**
 * La reserva activa en el celular: una tarjeta que flota encima de la barra de navegación.
 *
 * Es la contraparte de la franja de escritorio, con la misma información y otra forma: una solapa
 * verde con la cuenta regresiva que asoma por arriba, la esquina opuesta en verde, y abajo el lugar
 * con una barra de progreso en segmentos. Tocarla lleva a la reserva.
 *
 * **El "−" de la esquina la achica a una burbuja** que se arrastra a donde moleste menos, y tocar la
 * burbuja la vuelve tarjeta. Ver `BookingBubble` y `floatingTicket.ts`.
 *
 * **El cambio entre las dos es animado**: al achicar, la tarjeta baja y aparece la burbuja; al
 * agrandar, la burbuja explota y la tarjeta sube. Las animaciones están en `bookings.css`.
 *
 * **La silueta es un SVG medido, no cajas con bordes redondeados.** La base de la solapa se abre
 * hacia el borde de la tarjeta y la esquina verde baja en una curva en S. Con CSS eso son pedazos
 * encimados que dejan costuras, y con un SVG estirado las curvas se deforman según el ancho del
 * teléfono. Midiendo el ancho y el largo de la cuenta regresiva, cada curva se dibuja en píxeles
 * reales: igual en cualquier pantalla, y la solapa crece si el texto crece ("2 días").
 *
 * **Los colores salen de los tokens del tema**, en el SVG también: el cuerpo es `--color-surface`
 * —blanco en el claro, el gris de las tarjetas en el oscuro— y el texto usa las tintas de cada
 * tema. Lo único que no cambia es la tinta sobre el verde, que es oscura en los dos, igual que en
 * todos los botones verdes de la app.
 */

/*
 * La geometría, en píxeles. Sale del diseño, llevado de su escala a la del teléfono.
 */
/** Cuánto asoma la solapa por encima del borde de la tarjeta. */
const RISE = 14
/** El alto de la solapa, desde su borde de arriba. */
const TAB_HEIGHT = 40
/** Radio de las esquinas de la solapa y de la curva con que su base se abre hacia la tarjeta. */
const TAB_RADIUS = 14
/** Radio de las esquinas de la tarjeta. */
const CARD_RADIUS = 18
/** El alto de la cabecera dibujada: hasta donde baja la esquina verde de la derecha. */
const HEADER_HEIGHT = 56
/** Ancho de la esquina verde, medido desde el borde derecho. */
const CORNER_WIDTH = 96
/** Cuánto avanza la curva en S de la esquina mientras baja. */
const CORNER_CURVE = 34
/** El grosor de la línea verde que corre por el borde de arriba y une la solapa con la esquina. */
const TOP_LINE = 4

const SEGMENTS = 5

/**
 * En qué tramo de un cambio está la tarjeta.
 *
 * - `sinking`: la tarjeta baja. Al terminar se guarda que está achicada y aparece la burbuja.
 * - `popping`: la burbuja aparece con un rebote.
 * - `bursting`: la burbuja explota. Al terminar se guarda que está agrandada y aparece la tarjeta.
 * - `rising`: la tarjeta sube.
 */
type Transition = 'none' | 'sinking' | 'popping' | 'bursting' | 'rising'

/** Cuánto dura cada tramo. Son las duraciones de `bookings.css`: si cambian allá, cambian acá. */
const ANIMATION_MS: Record<Exclude<Transition, 'none'>, number> = {
  sinking: 280,
  popping: 320,
  bursting: 280,
  rising: 420,
}

const TRANSITION_CLASS: Record<Transition, string> = {
  none: '',
  sinking: 'booking-ticket--sinking pointer-events-none',
  popping: 'booking-bubble--popping',
  bursting: 'booking-bubble--bursting pointer-events-none',
  rising: 'booking-ticket--rising',
}

interface BookingTicketProps {
  booking: Booking
  /** La cuenta regresiva ya escrita: "32:23", "2 h 15 min". */
  countdown: string
  /** Qué se está contando, para quien no ve la tarjeta: "empieza en", "termina en". */
  countdownLabel: string
  /** De 0 a 1: cuánto se llenan los segmentos. */
  progress: number
  /** Cuánto falta, en milisegundos, para la cuenta corta de la burbuja. */
  remainingMs: number
}

export default function BookingTicket(props: BookingTicketProps) {
  const { booking, countdownLabel, progress, remainingMs } = props
  const { collapsed, collapse, expand, moveTo, position } = useFloatingTicket(booking.id)
  const name = booking.location?.stationName ?? `Conector ${String(booking.connectorId)}`
  const [transition, setTransition] = useState<Transition>('none')

  /*
   * Cada tramo avanza al siguiente cuando termina su animación. Con un temporizador y no con
   * `animationend`: quien pidió menos movimiento no tiene animación, así que ese evento no llegaría
   * nunca y la tarjeta quedaría trabada a mitad de camino. Para esa persona el tramo dura cero.
   */
  useEffect(() => {
    if (transition === 'none') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const timer = setTimeout(
      () => {
        if (transition === 'sinking') {
          collapse()
          setTransition('popping')
        } else if (transition === 'bursting') {
          expand()
          setTransition('rising')
        } else {
          setTransition('none')
        }
      },
      reduced ? 0 : ANIMATION_MS[transition],
    )
    return () => clearTimeout(timer)
  }, [transition, collapse, expand])

  if (collapsed) {
    const short = formatCompactCountdown(remainingMs)
    return (
      <BookingBubble
        countdown={short}
        label={`Tu reserva en ${name} ${countdownLabel} ${props.countdown}`}
        progress={progress}
        position={position}
        onMove={moveTo}
        onExpand={() => setTransition('bursting')}
        animationClass={TRANSITION_CLASS[transition]}
      />
    )
  }

  return (
    <TicketCard
      {...props}
      onCollapse={() => setTransition('sinking')}
      animationClass={TRANSITION_CLASS[transition]}
    />
  )
}

function TicketCard({
  booking,
  countdown,
  countdownLabel,
  progress,
  onCollapse,
  animationClass,
}: BookingTicketProps & { onCollapse: () => void; animationClass: string }) {
  const gradientId = useId()
  const cardRef = useRef<HTMLDivElement>(null)
  const tabRef = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState({ width: 0, tab: 0 })

  /*
   * Se mide antes de pintar y cada vez que cambia el ancho de la tarjeta o el de la cuenta
   * regresiva. Con `useEffect` se alcanzaría a ver un cuadro con la solapa del ancho anterior.
   */
  useLayoutEffect(() => {
    const card = cardRef.current
    const tab = tabRef.current
    if (card === null || tab === null) return

    const measure = () =>
      setSize((previous) => {
        const next = { width: card.clientWidth, tab: tab.offsetWidth }
        return next.width === previous.width && next.tab === previous.tab ? previous : next
      })

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(card)
    observer.observe(tab)
    return () => observer.disconnect()
  }, [])

  const { location } = booking
  const name = location?.stationName ?? `Conector ${String(booking.connectorId)}`

  return (
    <div
      className={`fixed inset-x-4 z-[1090] md:hidden ${animationClass}`}
      /*
        Por debajo de la barra (1100) y del panel que sube desde abajo (1200): cuando se abre el
        detalle de una estación, el panel la tapa en vez de quedar ella encima.
      */
      style={{ bottom: `calc(${String(FLOAT_ABOVE_PX)}px + env(safe-area-inset-bottom, 0px))` }}
    >
      <Link
        to="/profile/reservations"
        aria-label={`Tu reserva en ${name}: ${countdownLabel} ${countdown}. Ver reserva.`}
        className="focus-visible:outline-primary block rounded-[18px] focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {/*
        Una sola sombra para el SVG y el cuerpo juntos: `drop-shadow` sigue la figura, así que la
        solapa y la curva de la esquina también la proyectan.
      */}
        <div ref={cardRef} className="drop-shadow-[0_10px_24px_rgb(0_0_0/0.28)]">
          <div className="relative" style={{ height: HEADER_HEIGHT }}>
            {size.width > 0 && (
              <svg
                aria-hidden="true"
                className="absolute inset-0"
                width={size.width}
                height={HEADER_HEIGHT}
              >
                <defs>
                  {/*
                  Un solo degradado para la solapa y la esquina, a lo ancho de la tarjeta: las dos
                  piezas son del mismo verde que corre de izquierda a derecha.
                */}
                  <linearGradient
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1={0}
                    y1={0}
                    x2={size.width}
                    y2={0}
                  >
                    <stop offset="0" style={{ stopColor: 'var(--brand-from)' }} />
                    <stop offset="1" style={{ stopColor: 'var(--brand-to)' }} />
                  </linearGradient>
                </defs>

                <path
                  d={silhouette(size.width, size.tab)}
                  style={{ fill: 'var(--color-surface)' }}
                />
                {/*
                La línea del borde de arriba va antes que la solapa y la esquina: sus dos puntas
                quedan debajo de ellas, así que se ve como una sola pieza verde que las une.
              */}
                <path d={topLine(size.width, size.tab)} fill={`url(#${gradientId})`} />
                <path d={tabShape(size.tab)} fill={`url(#${gradientId})`} />
                <path d={cornerShape(size.width)} fill={`url(#${gradientId})`} />
              </svg>
            )}

            <span
              ref={tabRef}
              aria-hidden="true"
              className="text-on-primary absolute top-0 left-0 flex items-center px-4 text-[26px] leading-none font-extrabold tracking-tight tabular-nums"
              style={{ height: TAB_HEIGHT }}
            >
              {countdown}
            </span>
          </div>

          {/* `-mt-px` tapa la línea de un píxel que puede quedar entre el SVG y el cuerpo. */}
          <div className="bg-surface -mt-px flex flex-col gap-3 rounded-b-[18px] px-5 pt-1 pb-4">
            <p className="text-text truncate text-[26px] leading-tight font-extrabold uppercase">
              {name}
            </p>

            <Segments progress={progress} />

            <div className="text-text-muted flex flex-col text-[15px] leading-snug font-semibold">
              <span className="truncate">
                {location?.address ?? 'La estación ya no está disponible en el mapa'}
              </span>
              {location !== null && (
                <span>
                  {CONNECTOR_TYPE_LABEL[location.connectorType]} ·{' '}
                  {formatPower(location.maxPowerKw)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/*
      El "−" que la achica. Va AFUERA del enlace y encima de la esquina verde: adentro, tocarlo
      abriría también la reserva, y un botón dentro de un enlace no es algo que un lector de
      pantalla sepa anunciar.
    */}
      <button
        type="button"
        onClick={onCollapse}
        aria-label="Achicar la tarjeta de la reserva"
        title="Achicar"
        className="focus-visible:outline-on-primary absolute flex h-9 w-9 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 active:bg-black/10"
        style={{
          top: (RISE + HEADER_HEIGHT) / 2 - 18,
          right: (CORNER_WIDTH - CORNER_CURVE) / 2 - 18,
        }}
      >
        <span aria-hidden="true" className="bg-on-primary block h-[3px] w-4 rounded-full" />
      </button>
    </div>
  )
}

/**
 * La barra de progreso en cinco segmentos. El que está a medio llenar se desvanece hacia la
 * derecha en vez de cortar en seco, que es lo que marca el diseño: se lee como algo que avanza.
 *
 * El verde es parejo, la punta clara de la marca, y no el degradado: repetido en cada segmento,
 * el degradado los hacía ver como cinco piezas distintas en vez de una sola barra cortada.
 */
function Segments({ progress }: { progress: number }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-5 gap-4">
      {Array.from({ length: SEGMENTS }, (_, index) => {
        const fill = Math.min(1, Math.max(0, progress * SEGMENTS - index))
        const partial = fill > 0 && fill < 1
        return (
          <span key={index} className="bg-border relative h-2 overflow-hidden rounded-[2px]">
            {fill > 0 && (
              <span
                className="absolute inset-y-0 left-0 bg-[var(--brand-from)]"
                style={{
                  width: `${String(fill * 100)}%`,
                  maskImage: partial
                    ? 'linear-gradient(to right, black 45%, transparent)'
                    : undefined,
                }}
              />
            )}
          </span>
        )
      })}
    </div>
  )
}

/*
 * ---------------------------------------------------------------------------
 * Las figuras
 *
 * Coordenadas en píxeles, con el origen arriba a la izquierda de la cabecera: `y = 0` es el borde
 * de arriba de la solapa y `y = RISE` el borde de arriba de la tarjeta.
 * ---------------------------------------------------------------------------
 */

/**
 * La silueta entera de la cabecera, del color del cuerpo: la solapa que asoma, su base que se abre
 * en curva hacia el borde de la tarjeta, y la esquina redondeada de la derecha.
 */
function silhouette(width: number, tab: number): string {
  return [
    `M 0 ${HEADER_HEIGHT}`,
    `L 0 ${TAB_RADIUS}`,
    `Q 0 0 ${TAB_RADIUS} 0`,
    `L ${tab - TAB_RADIUS} 0`,
    `C ${tab} 0 ${tab} ${RISE} ${tab + TAB_RADIUS} ${RISE}`,
    `L ${width - CARD_RADIUS} ${RISE}`,
    `Q ${width} ${RISE} ${width} ${RISE + CARD_RADIUS}`,
    `L ${width} ${HEADER_HEIGHT}`,
    'Z',
  ].join(' ')
}

/**
 * La solapa verde: el mismo borde de arriba que la silueta, con la base abierta, y abajo a la
 * derecha una esquina redondeada donde se apoya sobre el cuerpo.
 */
function tabShape(tab: number): string {
  const bottomRadius = 10
  return [
    `M 0 ${TAB_HEIGHT}`,
    `L 0 ${TAB_RADIUS}`,
    `Q 0 0 ${TAB_RADIUS} 0`,
    `L ${tab - TAB_RADIUS} 0`,
    `C ${tab} 0 ${tab} ${RISE} ${tab + TAB_RADIUS} ${RISE}`,
    `L ${tab} ${RISE}`,
    `L ${tab} ${TAB_HEIGHT - bottomRadius}`,
    `Q ${tab} ${TAB_HEIGHT} ${tab - bottomRadius} ${TAB_HEIGHT}`,
    'Z',
  ].join(' ')
}

/**
 * La esquina verde de la derecha: sigue la esquina redondeada de la tarjeta por arriba y baja
 * hacia el cuerpo en una curva en S.
 */
function cornerShape(width: number): string {
  const start = width - CORNER_WIDTH
  const middle = start + CORNER_CURVE / 2
  return [
    `M ${start} ${RISE}`,
    `L ${width - CARD_RADIUS} ${RISE}`,
    `Q ${width} ${RISE} ${width} ${RISE + CARD_RADIUS}`,
    `L ${width} ${HEADER_HEIGHT}`,
    `L ${start + CORNER_CURVE} ${HEADER_HEIGHT}`,
    `C ${middle} ${HEADER_HEIGHT} ${middle} ${RISE} ${start} ${RISE}`,
    'Z',
  ].join(' ')
}

/**
 * La línea verde del borde de arriba, entre la solapa y la esquina. Arranca adentro de la solapa y
 * termina adentro de la curva de la esquina, para que no quede ninguna costura en las uniones.
 */
function topLine(width: number, tab: number): string {
  const from = tab - 2
  const to = width - CORNER_WIDTH + CORNER_CURVE / 2
  return `M ${from} ${RISE} L ${to} ${RISE} L ${to} ${RISE + TOP_LINE} L ${from} ${RISE + TOP_LINE} Z`
}
