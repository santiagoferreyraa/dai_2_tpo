import type { Theme } from '@/features/theme/theme'

/**
 * La paleta del fondo iridiscente, una por tema.
 *
 * Los cuatro vectores alimentan la fórmula de coseno del shader (ver `shader.ts`). Se eligen
 * contra el texto que va a ir encima, no por gusto: el tema claro tiene que quedar lo bastante
 * claro para leer texto casi negro y el oscuro lo bastante oscuro para leer texto casi blanco.
 *
 * De ahí que `b` —cuánto se aleja del color medio— sea chico en los dos. Un fondo iridiscente
 * con todo el rango de color se ve espectacular solo hasta que hay que leer algo encima.
 */
export interface BackdropPalette {
  /** Color medio. Es el que decide si el fondo es claro u oscuro. */
  a: [number, number, number]
  /** Cuánto se aleja del medio. Es el contraste del tornasol. */
  b: [number, number, number]
  /** Cuántas vueltas de color da. */
  c: [number, number, number]
  /** Desde dónde arranca cada canal. Correrlos entre sí es lo que produce la iridiscencia. */
  d: [number, number, number]
  specularColor: [number, number, number]
  specularStrength: number
  /** Cuánto se pronuncian los pliegues. */
  relief: number
}

/*
  Claro: lavanda pálido con vetas rosas y durazno, como la referencia.

  El medio ronda 0.86 y la amplitud 0.07, así que ningún canal baja de 0.78. Ese piso no es
  decorativo: es lo que hace que el texto secundario del tema claro llegue a los 4.5 de contraste
  que pide WCAG **sobre la zona más oscura del fondo**, que es la que manda. Con la paleta más
  saturada que tenía antes, el párrafo del hero se volvía ilegible sobre las vetas rosas.
*/
const LIGHT: BackdropPalette = {
  a: [0.86, 0.86, 0.94],
  b: [0.075, 0.07, 0.05],
  c: [1.0, 1.0, 1.0],
  d: [0.92, 0.03, 0.18],
  specularColor: [1.0, 0.96, 0.92],
  specularStrength: 0.22,
  relief: 0.3,
}

/*
  Oscuro: azul de medianoche con reflejos violeta.

  El brillo especular pesa más que en el claro y es a propósito: sobre un fondo oscuro el tornasol
  se pierde si no hay un reflejo que lo delate, mientras que sobre uno claro el mismo brillo se
  lava contra el fondo.

  El techo es el que manda acá, al revés que en el claro: ningún canal pasa de 0.34, porque es la
  zona MÁS clara del fondo la que le pelea el contraste al texto secundario, que es casi blanco.
*/
const DARK: BackdropPalette = {
  a: [0.14, 0.15, 0.25],
  b: [0.055, 0.05, 0.09],
  c: [1.0, 1.0, 1.0],
  d: [0.92, 0.03, 0.18],
  specularColor: [0.62, 0.55, 1.0],
  specularStrength: 0.28,
  relief: 0.35,
}

export function paletteFor(theme: Theme): BackdropPalette {
  return theme === 'light' ? LIGHT : DARK
}

/**
 * Un paso de la mezcla entre la paleta actual y la de destino.
 *
 * Existe para que el cambio de tema no sea un corte. El resto de la interfaz cambia de color con
 * una transición de CSS; el fondo no puede usarla porque lo pinta la placa de video, así que la
 * mezcla se hace acá, cuadro a cuadro. `amount` es cuánto acercarse en este cuadro.
 *
 * Se interpolan los CUATRO vectores y no solo el color medio: si `d` saltara de golpe, todo el
 * tornasol se daría vuelta en un cuadro aunque el brillo general viajara suave.
 */
export function blendPalette(
  from: BackdropPalette,
  to: BackdropPalette,
  amount: number,
): BackdropPalette {
  const mix = (x: number, y: number) => x + (y - x) * amount
  const mix3 = (x: [number, number, number], y: [number, number, number]) =>
    [mix(x[0], y[0]), mix(x[1], y[1]), mix(x[2], y[2])] as [number, number, number]

  return {
    a: mix3(from.a, to.a),
    b: mix3(from.b, to.b),
    c: mix3(from.c, to.c),
    d: mix3(from.d, to.d),
    specularColor: mix3(from.specularColor, to.specularColor),
    specularStrength: mix(from.specularStrength, to.specularStrength),
    relief: mix(from.relief, to.relief),
  }
}
