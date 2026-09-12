import { describeCard, formatExpiry } from '../format'
import type { PaymentMethod } from '../types'

import BrandMark from './BrandMark'

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
    /*
      El radio de las tarjetas de la portada, con el relleno de un panel de adentro: esta fila
      vive sobre la tarjeta de la sección, que ya es de vidrio, y un vidrio sobre otro suma
      blanco hasta dejar un rectángulo liso. Ver `.glass-inset` en `profile/profile.css`.
    */
    <li
      className={`glass-inset flex items-center gap-4 rounded-3xl p-4 ${
        card.expired ? 'opacity-70' : ''
      }`}
    >
      {/*
        El logo repite lo que ya dice el texto de al lado, y esa redundancia es el punto:
        recorrer una lista de tarjetas buscando la propia se hace mirando, no leyendo. El
        recuadro oscuro está porque los tres logos son claros y sobre el fondo de la tarjeta
        se pierden.
      */}
      <span
        aria-hidden="true"
        className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-[#1c1c1e]"
      >
        <BrandMark brand={card.brand} height={16} />
      </span>

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
