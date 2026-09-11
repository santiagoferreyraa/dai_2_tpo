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
export function groupSizesFor(brand: CardBrand | undefined): number[] {
  if (brand === 'AMEX') return [4, 6, 5]
  return [4, 4, 4, 4, 3]
}

export function groupCardNumber(digits: string): string {
  /*
   * La marca se deduce acá del prefijo en vez de recibirla como parámetro, y es para no
   * importar `brandOf`: vive en validation.ts, que importa de este archivo, así que la
   * dependencia daría vuelta redonda. Lo único que hace falta saber para agrupar es si es
   * AMEX, y eso lo dicen los dos primeros dígitos.
   */
  const groups = groupSizesFor(/^3[47]/.test(digits) ? 'AMEX' : undefined)

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

/**
 * Cuántos caracteres ocupa en pantalla un número de `digits` dígitos de esa marca.
 *
 * Se calcula agrupando un número de mentira en vez de sumar separadores a mano, y no es
 * rebusque: la cantidad de espacios depende de la agrupación —cuatro en una Visa de 19
 * dígitos, dos en una AMEX—, así que una fórmula escrita aparte se desincroniza el día que
 * `groupCardNumber` cambie. Derivándolo de la misma función, no puede.
 */
export function formattedLengthFor(brand: CardBrand | undefined, digits: number): number {
  const prefix = brand === 'AMEX' ? '34' : '4'
  return groupCardNumber(prefix.padEnd(digits, '0')).length
}

/**
 * El número tal como se lee en la tarjeta dibujada: lo escrito, y puntos por lo que falta.
 *
 * Los huecos se muestran desde el primer momento en vez de ir apareciendo. Es lo que hace que
 * la tarjeta se vea como una tarjeta apenas se abre el formulario, y no como una caja de color
 * que se va llenando de a poco; y además el número no se corre de lugar mientras se tipea,
 * porque el ancho ya está tomado.
 */
export function maskedCardNumber(digits: string, brand: CardBrand | undefined): string {
  // Lo habitual de cada marca —15 en AMEX, 16 en el resto—, salvo que ya se haya escrito más:
  // una Visa de 19 dígitos existe y no hay que recortarla.
  const slots = Math.max(brand === 'AMEX' ? 15 : 16, digits.length)
  return group(digits.padEnd(slots, '•'), brand)
}

/**
 * Agrupa un texto ya armado —dígitos, puntos o los dos— según la marca.
 *
 * Lo comparten los dos enmascarados de abajo, que solo se diferencian en de qué lado va el
 * relleno.
 */
function group(text: string, brand: CardBrand | undefined): string {
  const parts: string[] = []
  let cursor = 0

  for (const size of groupSizesFor(brand)) {
    if (cursor >= text.length) break
    parts.push(text.slice(cursor, cursor + size))
    cursor += size
  }
  if (cursor < text.length) parts.push(text.slice(cursor))

  return parts.join(' ')
}

/**
 * El número de una tarjeta ya guardada: puntos y los cuatro dígitos que sí conocemos.
 *
 * Es la contracara de {@link maskedCardNumber}. Ahí los puntos están a la derecha y son lo que
 * todavía no se escribió; acá están a la izquierda y son lo que el sistema nunca tuvo — de una
 * tarjeta registrada solo se guardan los últimos cuatro (RF02), así que este relleno no oculta
 * nada: representa una ausencia.
 */
export function maskedFromLastFour(lastFour: string, brand: CardBrand): string {
  const slots = brand === 'AMEX' ? 15 : 16
  return group('•'.repeat(slots - 4) + lastFour, brand)
}
