import { useLayoutEffect, useRef, useState } from 'react'

import { describeCard, formatExpiry, maskedFromLastFour } from '../format'
import type { PaymentMethod } from '../types'

import CardPreview from './CardPreview'

interface CardStackProps {
  cards: PaymentMethod[]
  onRemove: (card: PaymentMethod) => void
  /** El id de la tarjeta que se está eliminando, si hay alguna. */
  removingId: number | null
}

/** Cuánto de cada tarjeta asoma por debajo de la que tiene encima. */
const PEEK_PX = 72

/** La proporción de una tarjeta real: 85,60 × 53,98 mm. La misma que usa `CardPreview`. */
const CARD_RATIO = 1.586

/**
 * Las tarjetas guardadas apiladas como en una billetera, para el celular.
 *
 * **Por qué apiladas y no una lista.** En una pantalla angosta, tres tarjetas dibujadas enteras
 * son tres pantallazos de scroll para ver algo que se resuelve mirando. Apiladas entran todas de
 * una: de cada una asoma la franja de arriba, que es justo donde están la marca y el nombre, y
 * la última se ve completa. Es cómo se ven las tarjetas en una billetera de verdad, y por eso
 * no hay que explicar el gesto.
 *
 * **Tocar una la trae al frente.** Se despliega mostrándose entera y empujando hacia abajo a las
 * que tenía encima —no a las de atrás—, y recién ahí aparece el botón de eliminar. Que la acción
 * destructiva esté a dos toques y no a uno es a propósito: en una pila de rectángulos parecidos,
 * un botón por tarjeta a la vista es un borrado accidental esperando.
 *
 * **El alto se mide, no se supone.** Las posiciones son píxeles absolutos, y el alto de la
 * tarjeta depende del ancho disponible por su proporción. Se lee del contenedor con un
 * `ResizeObserver` en vez de fijar un número: escrito a mano, la pila se desarma en cuanto
 * alguien cambia un padding o gira el teléfono.
 */
export default function CardStack({ cards, onRemove, removingId }: CardStackProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cardHeight, setCardHeight] = useState(0)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (container === null) return

    const observer = new ResizeObserver(([entry]) => {
      setCardHeight(entry.contentRect.width / CARD_RATIO)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const expandedIndex = cards.findIndex((card) => card.id === expandedId)

  /*
   * Dónde arranca cada tarjeta. Apiladas es una franja por cada una que quedó atrás; con una
   * desplegada, las que están DESPUÉS se corren hacia abajo lo que falta para que se vea
   * entera. Las anteriores no se mueven: si se moviera toda la pila, la tarjeta que se acaba
   * de tocar se iría de donde estaba el dedo.
   */
  function offsetOf(index: number): number {
    const stacked = index * PEEK_PX
    if (expandedIndex === -1 || index <= expandedIndex) return stacked
    return stacked + (cardHeight - PEEK_PX)
  }

  const lastIndex = cards.length - 1
  const stackHeight = cards.length === 0 ? 0 : offsetOf(lastIndex) + cardHeight
  const expandedCard = expandedIndex === -1 ? null : cards[expandedIndex]

  return (
    <div>
      <div
        ref={containerRef}
        className="relative transition-[height] duration-300"
        style={{ height: stackHeight }}
      >
        {cards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setExpandedId(card.id === expandedId ? null : card.id)}
            // El texto real de la tarjeta vive acá: `CardPreview` es aria-hidden.
            aria-label={`${describeCard(card.brand, card.lastFour)}${card.expired ? ', vencida' : ''}`}
            aria-expanded={card.id === expandedId}
            className="absolute inset-x-0 block w-full text-left transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${offsetOf(index)}px)`,
              /*
                Las de más abajo se dibujan encima, que es como se apilan las cartas en la mano.
                Sin esto el orden lo decide el DOM y la sombra de cada una cae del lado
                equivocado.
              */
              zIndex: index,
            }}
          >
            <CardPreview
              brand={card.brand}
              numberText={maskedFromLastFour(card.lastFour, card.brand)}
              holder={card.label === null ? undefined : { label: 'Etiqueta', value: card.label }}
              expiry={formatExpiry(card.expiryMonth, card.expiryYear)}
              expired={card.expired}
            />
          </button>
        ))}
      </div>

      {/*
        Las acciones van abajo de la pila y no flotando sobre la tarjeta: encima taparían el
        número, que es lo único que permite reconocerla y confirmar que se está por borrar la
        correcta.
      */}
      {expandedCard !== null && (
        <div className="mt-4 flex items-center gap-3">
          <p className="text-text-muted min-w-0 flex-1 text-sm">
            {expandedCard.expired
              ? `Venció en ${formatExpiry(expandedCard.expiryMonth, expandedCard.expiryYear)}. No sirve para reservar.`
              : `Vence ${formatExpiry(expandedCard.expiryMonth, expandedCard.expiryYear)}`}
          </p>

          <button
            type="button"
            onClick={() => onRemove(expandedCard)}
            disabled={removingId === expandedCard.id}
            aria-label={`Eliminar ${describeCard(expandedCard.brand, expandedCard.lastFour)}`}
            className="border-border hover:bg-background shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
          >
            {removingId === expandedCard.id ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      )}
    </div>
  )
}
