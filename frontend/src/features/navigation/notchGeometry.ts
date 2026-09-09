/**
 * La forma de la barra del celular: medidas y el recorte de la muesca.
 *
 * **Por qué la muesca dejó de ser una máscara de degradado.** La primera versión abría el
 * hueco restándole a la barra un `radial-gradient`, que es puro CSS y se anima solo. El
 * problema es lo que pasa donde el círculo corta el borde de arriba: ahí queda una punta
 * afilada, y el pedido era justamente que ese encuentro fuera redondeado. Un labio redondeado
 * es un arco tangente al borde recto Y al círculo del hueco, y esa región no se puede escribir
 * como unión ni intersección de degradados —hace falta un arco de radio propio, con sus dos
 * puntos de tangencia—. Con arcos de verdad, la barra pasa a ser un `path`.
 *
 * Todas las medidas viven acá y no repartidas entre el CSS y el componente: el CSS las recibe
 * como variables (ver `MobileNav.tsx`), así que hay un solo lugar donde cambiarlas.
 */

export const NAV_GEOMETRY = {
  /** Alto de la barra. */
  barHeight: 64,
  /** Radio de las cuatro esquinas de la barra. */
  barRadius: 28,
  /** Diámetro del círculo verde. */
  puckSize: 52,
  /**
   * Cuánto sobresale el centro del círculo por encima del borde de arriba de la barra.
   *
   * Es el número que decide qué tan "apoyado" se ve el círculo. Cuanto más chico, más abajo
   * queda y más hundido en la barra.
   */
  notchLift: 10,
  /** Aire entre el círculo y el borde del hueco. La diferencia entre los dos radios. */
  notchGap: 6,
  /** Radio de los dos labios redondeados donde la muesca se encuentra con el borde recto. */
  filletRadius: 12,
  /**
   * Margen del carril por el que viaja el círculo.
   *
   * Tiene que ser el mismo que el padding horizontal de la barra, porque de ahí sale el centro
   * de cada sección. `MobileNav.tsx` usa esta constante para las dos cosas, así que no pueden
   * separarse.
   */
  trackInset: 12,
} as const

/** Radio del hueco. Sale del círculo más el aire: no es un número suelto que se pueda desfasar. */
export const NOTCH_RADIUS = NAV_GEOMETRY.puckSize / 2 + NAV_GEOMETRY.notchGap

/**
 * El centro de una sección, en píxeles desde el borde izquierdo de la barra.
 *
 * `index` es fraccionario a propósito: durante la animación vale 1.4 o 2.7, y de ahí sale la
 * posición intermedia del hueco. Es la misma cuenta que hace el CSS para el círculo, así que
 * los dos caen siempre en el mismo lugar.
 */
export function sectionCenter(index: number, barWidth: number, sectionCount: number): number {
  const { trackInset } = NAV_GEOMETRY
  const track = barWidth - trackInset * 2
  return trackInset + ((index + 0.5) / sectionCount) * track
}

/**
 * El recorte de la muesca, como un `path` cerrado que se le RESTA a la barra.
 *
 * Se devuelve el pedazo que se saca y no la barra ya recortada, y eso es lo que hace que el
 * caso difícil se resuelva solo: cuando la sección activa es la primera o la última, la muesca
 * cae encima de la esquina redondeada de la barra. Restando figuras, ahí no hay nada que
 * decidir —la esquina y el hueco se funden en una sola curva—. Recortando el contorno a mano
 * habría que detectar el solapamiento y coser los dos arcos.
 *
 * El recorrido, de izquierda a derecha: el labio de entrada, el arco grande del hueco, el
 * labio de salida, y el cierre por arriba de la barra, donde no hay material que sacar.
 */
export function notchCutPath(centerX: number): string {
  const { notchLift: lift, filletRadius: r } = NAV_GEOMETRY
  const R = NOTCH_RADIUS

  /*
    El centro del labio está a `r` del borde recto (lo toca) y a `R + r` del centro del hueco
    (lo toca por afuera). Con esas dos condiciones, Pitágoras da la única distancia horizontal
    posible entre el centro del hueco y el del labio.
  */
  const lipDistance = Math.sqrt((R + r) ** 2 - (r + lift) ** 2)

  /*
    Donde el labio se encuentra con el arco grande. Está sobre la recta que une los dos
    centros, a `R` del centro del hueco: es la definición de tangencia entre dos círculos.
  */
  const tangentX = (R * lipDistance) / (R + r)
  const tangentY = -lift + (R * (r + lift)) / (R + r)

  /* Hasta dónde sube el cierre. Cualquier valor por encima del círculo sirve: es aire. */
  const top = -NAV_GEOMETRY.puckSize

  const round = (value: number) => Math.round(value * 100) / 100

  return [
    `M ${round(centerX - lipDistance)} 0`,
    `A ${r} ${r} 0 0 1 ${round(centerX - tangentX)} ${round(tangentY)}`,
    `A ${R} ${R} 0 0 0 ${round(centerX + tangentX)} ${round(tangentY)}`,
    `A ${r} ${r} 0 0 1 ${round(centerX + lipDistance)} 0`,
    `L ${round(centerX + lipDistance)} ${top}`,
    `L ${round(centerX - lipDistance)} ${top}`,
    'Z',
  ].join(' ')
}
