import { describeCard, formatExpiry } from '../format'
import type { PaymentMethod } from '../types'

interface PaymentMethodRowProps {
  card: PaymentMethod
  onRemove: (card: PaymentMethod) => void
  /** Si esta fila es la que se está eliminando. Bloquea el botón sin bloquear las demás. */
  removing: boolean
}

/**
 * Una tarjeta en el listado.
 *
 * **Las vencidas se muestran, no se esconden.** Es la decisión de diseño de esta pantalla: si
 * desaparecieran, el conductor no tendría cómo eliminarlas y —peor— no entendería por qué no
 * puede reservar cuando la lista le muestra una tarjeta. Se listan marcadas, con el aviso al
 * lado, que es la única forma de que la pantalla explique el bloqueo en vez de causarlo.
 */
export default function PaymentMethodRow({ card, onRemove, removing }: PaymentMethodRowProps) {
  return (
    <li
      className={`border-border bg-surface flex items-center gap-4 rounded-xl border p-4 ${
        card.expired ? 'opacity-70' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {describeCard(card.brand, card.lastFour)}
          {card.label !== null && (
            <span className="text-text-muted font-normal"> · {card.label}</span>
          )}
        </p>

        <p className={`mt-0.5 text-xs ${card.expired ? 'text-red-600' : 'text-text-muted'}`}>
          {card.expired
            ? `Venció en ${formatExpiry(card.expiryMonth, card.expiryYear)}. No sirve para reservar.`
            : `Vence ${formatExpiry(card.expiryMonth, card.expiryYear)}`}
        </p>
      </div>

      <button
        className="border-border hover:bg-background shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        type="button"
        onClick={() => onRemove(card)}
        disabled={removing}
        // El nombre de la tarjeta va en la etiqueta accesible: con tres botones "Eliminar"
        // seguidos, un lector de pantalla no distingue cuál es cuál.
        aria-label={`Eliminar ${describeCard(card.brand, card.lastFour)}`}
      >
        {removing ? 'Eliminando…' : 'Eliminar'}
      </button>
    </li>
  )
}
