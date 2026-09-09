/**
 * La forma de las barras de navegación: medidas y el recorte de la muesca.
 *
 * **Por qué la muesca no es una máscara de degradado.** La primera versión abría el hueco
 * restándole a la barra un `radial-gradient`, que es puro CSS y se anima solo. El problema es lo
 * que pasa donde el círculo corta el borde recto: ahí queda una punta afilada, y el pedido era
 * justamente que ese encuentro fuera redondeado. Un labio redondeado es un arco tangente al
 * borde recto Y al círculo del hueco, y esa región no se puede escribir como unión ni
 * intersección de degradados —hace falta un arco de radio propio, con sus dos puntos de
 * tangencia—. Con arcos de verdad, la muesca pasa a ser un `path`.
 *
 * **La figura es una sola para las dos barras.** La del celular la apoya sobre su borde de
 * arriba y el riel de escritorio sobre su borde derecho, pero es el mismo recorte girado un
 * cuarto de vuelta. Las cuentas viven en `notchShape()` y los dos dibujos las comparten: si cada
 * uno hiciera su propia trigonometría, alcanzaría con tocar un radio en uno para que dejaran de
 * verse iguales.
 *
 * Todas las medidas viven acá y no repartidas entre el CSS y los componentes: el CSS las recibe
 * como variables, así que hay un solo lugar donde cambiarlas.
 */

export const NAV_GEOMETRY = {
  /** Alto de la barra del celular. */
  barHeight: 64,
  /** Radio de las cuatro esquinas de la barra del celular. */
  barRadius: 28,
  /** Diámetro del círculo verde. El mismo en las dos barras. */
  puckSize: 52,
  /**
   * Cuánto sobresale el centro del círculo por fuera del borde de la barra.
   *
   * Es el número que decide qué tan "apoyado" se ve el círculo. Cuanto más chico, más hundido
   * queda en la barra.
   */
  notchLift: 10,
  /** Aire entre el círculo y el borde del hueco. La diferencia entre los dos radios. */
  notchGap: 6,
  /** Radio de los dos labios redondeados donde la muesca se encuentra con el borde recto. */
  filletRadius: 12,
  /**
   * Margen del carril por el que viaja el círculo en el celular.
   *
   * Tiene que ser el mismo que el padding horizontal de la barra, porque de ahí sale el centro
   * de cada sección. `MobileNav.tsx` usa esta constante para las dos cosas, así que no pueden
   * separarse.
   */
  trackInset: 12,
} as const

/**
 * El centro de una sección en la barra del celular, en píxeles desde su borde izquierdo.
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
 * Las medidas del riel vertical de escritorio.
 *
 * A diferencia de la barra del celular, acá NO hay que medir nada: el riel tiene tantos ítems
 * como secciones y todos miden lo mismo, así que su ancho y su alto salen de una cuenta. Eso es
 * lo que permite recortarlo con un `clip-path` en píxeles y ahorrarse el `ResizeObserver`.
 *
 * `itemSize` y `gap` tienen que coincidir con las clases del componente, que es de donde sale el
 * alto real de la fila.
 */
export const RAIL_GEOMETRY = {
  itemSize: 44,
  gap: 8,
  paddingX: 10,
  paddingY: 12,
} as const

/**
 * El ancho del riel.
 *
 * Da 64, que es exactamente el alto de la barra del celular, y no es casualidad: la muesca es la
 * misma figura en las dos, así que apoyarla sobre un borde del mismo grosor es lo que hace que
 * se vea igual de hundida en una y en otra.
 */
export const RAIL_WIDTH = RAIL_GEOMETRY.itemSize + RAIL_GEOMETRY.paddingX * 2

/** De un ítem al siguiente, de centro a centro. */
export const RAIL_STEP = RAIL_GEOMETRY.itemSize + RAIL_GEOMETRY.gap

/**
 * El círculo del riel, y cuánto sobresale.
 *
 * Son los dos únicos números de la muesca que el riel no comparte con el celular, y van juntos
 * porque resuelven el mismo pedido: que el círculo asome apenas por el costado en vez de quedar
 * colgando afuera.
 *
 * **Sobresalir menos obliga a una muesca más profunda, y esa parte no se puede esquivar:** el
 * hueco tiene que contener al círculo, así que correr el centro hacia adentro mete con él todo
 * el arco. La cuenta es fija —lo que sobresale más lo que entra suman el diámetro más el aire—,
 * y con un círculo de 52 no hay reparto que deje al riel entero: para que asomara poco, la
 * muesca se lo comía casi todo.
 *
 * Por eso el círculo del riel es más chico. 44 no es un número elegido a ojo: es el alto de sus
 * ítems, así que el círculo mide exactamente lo mismo que el cuadro que ocupa cada ícono.
 *
 * Con `lift` en 0 el centro cae justo sobre el borde, y entonces sobresale exactamente la mitad
 * —22 de 44—. Es una posición que se explica sola, y deja los otros 28 de muesca sobre los 64
 * de ancho del riel.
 */
export const RAIL_PUCK_SIZE = RAIL_GEOMETRY.itemSize
export const RAIL_NOTCH_LIFT = 0

export function railHeight(sectionCount: number): number {
  const { paddingY, itemSize, gap } = RAIL_GEOMETRY
  return paddingY * 2 + sectionCount * itemSize + (sectionCount - 1) * gap
}

/**
 * El centro vertical de un ítem del riel.
 *
 * `index` es fraccionario durante la animación, igual que en `sectionCenter`.
 */
export function railItemCenter(index: number): number {
  return RAIL_GEOMETRY.paddingY + RAIL_GEOMETRY.itemSize / 2 + index * RAIL_STEP
}

/**
 * Las medidas de la muesca, resueltas una sola vez para las dos orientaciones.
 *
 * `lift` y `puckSize` son lo único que las dos barras no comparten. El aire alrededor del círculo
 * y el radio de los labios salen de las mismas constantes, que es lo que hace que las dos muescas
 * sean la misma figura a dos tamaños y no dos figuras parecidas.
 *
 * `along` corre a lo largo del borde y `into` hacia adentro del material. Los nombres son
 * genéricos —y no `x` e `y`— justamente porque la misma figura se apoya sobre un borde de arriba
 * en un caso y sobre uno de la derecha en el otro.
 */
function notchShape(lift: number, puckSize: number) {
  const { filletRadius: r } = NAV_GEOMETRY
  /* El radio del hueco sale del círculo más el aire: no es un número suelto que se desfase. */
  const R = puckSize / 2 + NAV_GEOMETRY.notchGap

  /*
    El centro del labio está a `r` del borde recto (lo toca) y a `R + r` del centro del hueco (lo
    toca por afuera). Con esas dos condiciones, Pitágoras da la única distancia posible entre el
    centro del hueco y el del labio, medida a lo largo del borde.
  */
  const lipDistance = Math.sqrt((R + r) ** 2 - (r + lift) ** 2)

  /*
    Donde el labio se encuentra con el arco grande. Está sobre la recta que une los dos centros,
    a `R` del centro del hueco: es la definición de tangencia entre dos círculos.
  */
  const tangentAlong = (R * lipDistance) / (R + r)
  const tangentInto = -lift + (R * (r + lift)) / (R + r)

  /* Hasta dónde llega el cierre por fuera del borde. Cualquier valor pasando el círculo sirve. */
  const outside = puckSize

  return { R, r, lipDistance, tangentAlong, tangentInto, outside }
}

const round = (value: number) => Math.round(value * 100) / 100

/**
 * El recorte de la muesca sobre un borde horizontal, para la barra del celular.
 *
 * Se devuelve el pedazo que se saca y no la barra ya recortada, y eso es lo que hace que el caso
 * difícil se resuelva solo: cuando la sección activa es la primera o la última, la muesca cae
 * encima de la esquina redondeada de la barra. Restando figuras ahí no hay nada que decidir —la
 * esquina y el hueco se funden en una sola curva—. Recortando el contorno a mano habría que
 * detectar el solapamiento y coser los dos arcos.
 *
 * El recorrido: el labio de entrada, el arco grande del hueco, el labio de salida, y el cierre
 * por fuera de la barra, donde no hay material que sacar.
 */
export function notchCutPath(centerX: number): string {
  const { R, r, lipDistance, tangentAlong, tangentInto, outside } = notchShape(
    NAV_GEOMETRY.notchLift,
    NAV_GEOMETRY.puckSize,
  )

  return [
    `M ${round(centerX - lipDistance)} 0`,
    `A ${r} ${r} 0 0 1 ${round(centerX - tangentAlong)} ${round(tangentInto)}`,
    `A ${R} ${R} 0 0 0 ${round(centerX + tangentAlong)} ${round(tangentInto)}`,
    `A ${r} ${r} 0 0 1 ${round(centerX + lipDistance)} 0`,
    `L ${round(centerX + lipDistance)} ${-outside}`,
    `L ${round(centerX - lipDistance)} ${-outside}`,
    'Z',
  ].join(' ')
}

/**
 * El mismo recorte sobre un borde vertical, para el riel: el material queda a la izquierda y el
 * círculo sale hacia la derecha.
 *
 * Es la figura de arriba girada un cuarto de vuelta, con la correspondencia
 * `(a lo largo, hacia adentro) → (Y creciente, X decreciente)`. Ese giro **conserva la
 * orientación**, así que las banderas de barrido de los arcos son las mismas que en la
 * horizontal; si en vez de girar se espejara, habría que darlas vuelta.
 */
export function verticalNotchCutPath(edgeX: number, centerY: number): string {
  const { R, r, lipDistance, tangentAlong, tangentInto, outside } = notchShape(
    RAIL_NOTCH_LIFT,
    RAIL_PUCK_SIZE,
  )

  return [
    `M ${edgeX} ${round(centerY - lipDistance)}`,
    `A ${r} ${r} 0 0 1 ${round(edgeX - tangentInto)} ${round(centerY - tangentAlong)}`,
    `A ${R} ${R} 0 0 0 ${round(edgeX - tangentInto)} ${round(centerY + tangentAlong)}`,
    `A ${r} ${r} 0 0 1 ${edgeX} ${round(centerY + lipDistance)}`,
    `L ${round(edgeX + outside)} ${round(centerY + lipDistance)}`,
    `L ${round(edgeX + outside)} ${round(centerY - lipDistance)}`,
    'Z',
  ].join(' ')
}

/**
 * El contorno del riel: un rectángulo con las esquinas redondeadas, escrito como `path`.
 *
 * Tiene que ser un `path` y no un `inset()` porque va junto con el recorte de la muesca dentro
 * del mismo `clip-path`, y ahí las dos figuras tienen que hablar el mismo idioma.
 */
function railOutlinePath(width: number, height: number, radius: number): string {
  return [
    `M ${radius} 0`,
    `H ${width - radius}`,
    `A ${radius} ${radius} 0 0 1 ${width} ${radius}`,
    `V ${height - radius}`,
    `A ${radius} ${radius} 0 0 1 ${width - radius} ${height}`,
    `H ${radius}`,
    `A ${radius} ${radius} 0 0 1 0 ${height - radius}`,
    `V ${radius}`,
    `A ${radius} ${radius} 0 0 1 ${radius} 0`,
    'Z',
  ].join(' ')
}

/**
 * El `clip-path` completo del riel: el contorno menos la muesca.
 *
 * **La resta la hace `evenodd`, y por eso son dos subtrazados y no uno cosido.** Con esa regla un
 * punto cuenta cuántas figuras lo contienen: dentro del contorno nada más va uno —impar, se
 * dibuja—; dentro del contorno Y de la muesca van dos —par, se descarta—. Eso da la resta sin
 * tener que calcular dónde se cruzan los bordes, que es lo que haría falta para escribir el
 * contorno recortado a mano, y resuelve solo el caso en que la muesca pisa la punta redondeada.
 *
 * El pedazo de muesca que queda por fuera del riel cuenta como "dentro" para `evenodd`, pero es
 * inofensivo: cae afuera de la caja del elemento, donde no hay nada pintado que mostrar.
 *
 * Va como `clip-path` y no como máscara de SVG para que el riel pueda seguir siendo un `div` con
 * vidrio: `backdrop-filter` necesita un elemento de verdad, y un `<path>` de SVG no lo es.
 */
export function railClipPath(centerY: number, sectionCount: number): string {
  const outline = railOutlinePath(RAIL_WIDTH, railHeight(sectionCount), RAIL_WIDTH / 2)
  const cut = verticalNotchCutPath(RAIL_WIDTH, centerY)

  return `path(evenodd, "${outline} ${cut}")`
}
