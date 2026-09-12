import type { CardBrand } from '../types'

import BrandMark from './BrandMark'

interface CardPreviewProps {
  brand: CardBrand | undefined
  /** El número ya enmascarado y agrupado. Lo arma quien llama, con los helpers de `format`. */
  numberText: string
  /**
   * Qué decir abajo a la izquierda, donde el plástico trae el titular.
   *
   * Es un par etiqueta/valor y no un nombre suelto porque las dos pantallas ponen cosas
   * distintas: el formulario muestra el titular que se está escribiendo, y una tarjeta ya
   * guardada muestra su etiqueta —el titular no se guarda, así que ahí no hay nombre que
   * poner—. Sin nada que decir, el hueco no se dibuja.
   */
  holder?: { label: string; value: string }
  /** El vencimiento como se lee: "09/29". */
  expiry: string
  /** Marca la tarjeta como vencida, cruzándole una banda. */
  expired?: boolean
  /** Posicionamiento y márgenes. La tarjeta no decide dónde va. */
  className?: string
}

/**
 * Una tarjeta de crédito dibujada, con el diseño de su marca.
 *
 * La usan el formulario —donde se completa sola mientras se escribe— y el listado del celular,
 * que apila las tarjetas guardadas como una billetera.
 *
 * **Para qué sirve en el formulario, más allá de que quede lindo.** El error que hay que atajar
 * es copiar mal el número, y el modo natural de revisarlo es comparar contra el plástico que se
 * tiene en la mano. Un campo de texto no se parece a una tarjeta; esto sí, con la misma
 * agrupación de dígitos y los mismos datos en los mismos lugares.
 *
 * **El diseño cambia con la marca**, y eso también es información: si alguien va a cargar su
 * Visa y la tarjeta se pone gris con los círculos de Mastercard, algo se escribió mal en los
 * primeros dígitos — se ve antes de terminar de tipear, no al apretar Guardar.
 *
 * **No tiene dorso ni CVV.** El formulario no pide el código de seguridad: no hace falta para
 * cambiar el número por un token y guardarlo está prohibido por PCI-DSS. Sin ese dato no hay
 * nada que mostrar del otro lado.
 *
 * `aria-hidden` porque no aporta nada a quien no la ve: en el formulario todo lo que dice está
 * en los campos, y en el listado está en el texto de cada fila. Anunciarla sería duplicar.
 */
export default function CardPreview({
  brand,
  numberText,
  holder,
  expiry,
  expired = false,
  className = '',
}: CardPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative aspect-[1.586/1] w-full overflow-hidden rounded-2xl p-5 text-white shadow-xl transition-[background] duration-500 ${SURFACE[brand ?? 'UNKNOWN']} ${className}`}
    >
      {/*
        Un brillo diagonal apenas visible. Es lo que separa una tarjeta de un rectángulo de
        color: el plástico refleja, y sin algo de eso la figura se lee como un cartel.
      */}
      <div className="pointer-events-none absolute -top-1/2 -right-1/4 h-[200%] w-[80%] rotate-12 bg-gradient-to-b from-white/15 to-transparent" />

      {/* Una tarjeta vencida se apaga, además de decirlo. El color solo no alcanza. */}
      {expired && <div className="pointer-events-none absolute inset-0 bg-black/45" />}

      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <span className="text-sm font-semibold tracking-wide opacity-90">Ecopedia</span>
          {expired ? (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold tracking-widest uppercase">
              Vencida
            </span>
          ) : (
            <ContactlessIcon />
          )}
        </div>

        <Chip />

        <p className="font-mono text-lg tracking-[0.12em] tabular-nums sm:text-xl">{numberText}</p>

        <div className="flex items-end justify-between gap-3">
          {holder !== undefined ? (
            <div className="min-w-0">
              <p className="text-[10px] tracking-widest uppercase opacity-70">{holder.label}</p>
              {/*
                Mayúsculas como están impresas en el plástico, y `truncate` porque un nombre
                largo no puede empujar al vencimiento fuera de la tarjeta.
              */}
              <p className="truncate text-sm font-medium uppercase">{holder.value}</p>
            </div>
          ) : (
            /* Sin titular el vencimiento se va a la izquierda, en vez de quedar suelto. */
            <span className="flex-1" />
          )}

          <div className="shrink-0">
            <p className="text-[10px] tracking-widest uppercase opacity-70">Vence</p>
            <p className="font-mono text-sm tabular-nums">{expiry}</p>
          </div>

          <div className="shrink-0">
            <BrandMark brand={brand} height={22} />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * El fondo de cada marca.
 *
 * Los colores son los que cada una usa en su identidad —el azul marino de Visa, el grafito con
 * el que suele imprimirse Mastercard, el celeste de AMEX— porque el objetivo es que se reconozca
 * de un vistazo. Sin marca todavía, el verde de Ecopedia: la tarjeta ya se ve como una tarjeta
 * antes de escribir el primer dígito, en vez de aparecer de golpe cuando se reconoce el número.
 */
const SURFACE: Record<CardBrand | 'UNKNOWN', string> = {
  VISA: 'bg-gradient-to-br from-[#1a1f71] via-[#2545a6] to-[#4062c9]',
  MASTERCARD: 'bg-gradient-to-br from-[#1c1c1e] via-[#2f3033] to-[#4a4b50]',
  AMEX: 'bg-gradient-to-br from-[#016fd0] via-[#0a90c4] to-[#12b0bd]',
  UNKNOWN: 'bg-gradient-to-br from-[#14342a] via-[#1f5340] to-[#2f7a5c]',
}

/** El chip dorado. Cuatro líneas sobre un rectángulo alcanzan para que se lea como un chip. */
function Chip() {
  return (
    <svg viewBox="0 0 44 34" className="h-8 w-11" aria-hidden="true">
      <rect width="44" height="34" rx="5" fill="#e3c07a" />
      <rect x="1.5" y="1.5" width="41" height="31" rx="4" fill="none" stroke="#b9974a" />
      <path
        d="M15 1.5v31M29 1.5v31M1.5 12h41M1.5 22h41"
        stroke="#b9974a"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

/** Las ondas del pago sin contacto. */
function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 opacity-90" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8.5 8a5.5 5.5 0 0 1 0 8" />
        <path d="M12 5.5a9 9 0 0 1 0 13" />
        <path d="M15.5 3a12.5 12.5 0 0 1 0 18" />
      </g>
    </svg>
  )
}
