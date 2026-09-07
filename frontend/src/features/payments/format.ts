import type { CardBrand } from './types'

/**
 * Cómo se escribe una tarjeta en pantalla.
 *
 * Separado de `validation.ts` a propósito: acá está lo que se muestra, allá lo que se acepta.
 * Son dos motivos distintos para cambiar el archivo.
 */

/** El nombre comercial de cada marca. El enum viaja en mayúsculas; el usuario lee otra cosa. */
export const BRAND_LABEL: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
}

/**
 * "Visa •••• 4242".
 *
 * Los puntos son cuatro y no la cantidad real de dígitos ocultos: nadie cuenta los puntos, y
 * fingir el largo del número no aporta nada. Es la convención que usan las apps de pago.
 */
export function describeCard(brand: CardBrand, lastFour: string): string {
  return `${BRAND_LABEL[brand]} •••• ${lastFour}`
}

/** "09/29", con el mes en dos dígitos como está impreso en la tarjeta. */
export function formatExpiry(month: number, year: number): string {
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`
}

/**
 * Agrupa el número en bloques mientras se escribe.
 *
 * Se hace por el mismo motivo por el que la tarjeta física lo trae impreso así: con dieciséis
 * dígitos seguidos no hay forma de comparar contra el plástico sin perder la cuenta. AMEX usa
 * 4-6-5 y el resto 4-4-4-4, y respetar cada agrupación es lo que hace que el número en
 * pantalla se vea igual que el de la mano.
 */
export function groupCardNumber(digits: string): string {
  const isAmex = /^3[47]/.test(digits)
  const groups = isAmex ? [4, 6, 5] : [4, 4, 4, 4, 3]

  const parts: string[] = []
  let cursor = 0

  for (const size of groups) {
    if (cursor >= digits.length) break
    parts.push(digits.slice(cursor, cursor + size))
    cursor += size
  }

  // Lo que sobre de un número más largo que la agrupación prevista se agrega al final entero,
  // en vez de perderse: el campo tiene que mostrar todo lo que la persona escribió.
  if (cursor < digits.length) parts.push(digits.slice(cursor))

  return parts.join(' ')
}
