/**
 * La silueta de la cabecera del perfil: el redondel del avatar y la barra de datos, dibujados
 * como **una sola figura**.
 *
 * Es la misma técnica que tenía el riel con su tirador y existe por el mismo motivo: con
 * vidrio, dos cajas apiladas no se funden. Donde se pisan, el cuerpo semitransparente se suma y
 * queda una mancha más oscura; y los dos bordes se cruzan dejando una costura. Un solo contorno
 * no tiene ni una cosa ni la otra, y es lo que hace que el redondel se lea como parte de la
 * barra y no como una medalla apoyada encima.
 *
 * **El remate en diagonal es el otro motivo por el que esto es un `path`.** Una caja de CSS
 * termina en noventa grados; con `clip-path` se podría cortar, pero el corte sale en punta viva
 * y el borde no lo acompaña. Acá la diagonal tiene sus dos esquinas redondeadas como cualquier
 * otra, porque son arcos tangentes a las dos rectas que se encuentran.
 *
 * El ancho se mide con un `ResizeObserver`, igual que antes: un `path` se escribe en píxeles.
 */

export const HEADER_SHAPE = {
  /**
   * Radio del redondel del avatar.
   *
   * De acá sale el ALTO de toda la figura, que es su diámetro: el redondel es lo más alto que
   * hay y la barra va centrada contra él.
   */
  avatarRadius: 62,
  /** Alto de la barra de datos. Menos que el diámetro, o el redondel no asomaría. */
  barHeight: 96,
  /** Radio de los dos labios donde el redondel se funde con los bordes de la barra. */
  filletRadius: 18,
  /** Radio de las esquinas del remate en diagonal. */
  cornerRadius: 16,
  /**
   * Cuánto se corre hacia adentro el borde de abajo respecto del de arriba.
   *
   * Es el remate en diagonal. Que el lado corto sea el de ABAJO no es indistinto: la diagonal
   * apunta hacia adentro y hacia el texto, así que la figura se lee leyendo en el mismo sentido
   * en que se lee el renglón.
   */
  slant: 66,
} as const

/** El alto de la figura entera. No es un número aparte: es el diámetro del redondel. */
export const HEADER_HEIGHT = HEADER_SHAPE.avatarRadius * 2

const round = (value: number) => Math.round(value * 100) / 100

type Point = [number, number]

/**
 * Los dos puntos donde arranca y termina la curva que redondea una esquina.
 *
 * Vale para cualquier ángulo, no solo para noventa grados, y eso es lo que hace falta acá: las
 * dos esquinas de la diagonal son oblicuas. La cuenta es la de siempre —la tangente se separa
 * del vértice `r / tan(ángulo / 2)`— y con un ángulo recto devuelve `r`, que es lo que hace un
 * `border-radius` común.
 */
function cornerCut(vertex: Point, incoming: Point, outgoing: Point, radius: number) {
  const dot = -incoming[0] * outgoing[0] + -incoming[1] * outgoing[1]
  const angle = Math.acos(Math.min(1, Math.max(-1, dot)))
  const cut = radius / Math.tan(angle / 2)

  return {
    from: [vertex[0] - incoming[0] * cut, vertex[1] - incoming[1] * cut] as Point,
    to: [vertex[0] + outgoing[0] * cut, vertex[1] + outgoing[1] * cut] as Point,
  }
}

/**
 * El contorno completo, recorrido en sentido horario desde el borde de arriba de la barra.
 *
 * `width` es el de la figura entera. El alto no se pasa: lo fija el redondel.
 */
export function headerOutlinePath(width: number): string {
  const { avatarRadius: Rc, barHeight: h, filletRadius: rf, cornerRadius: rr, slant } = HEADER_SHAPE

  const centerY = Rc
  const top = centerY - h / 2
  const bottom = centerY + h / 2

  /*
    Donde el labio toca el borde recto de la barra. Su centro está a `rf` por fuera de ese borde
    y a `Rc + rf` del centro del redondel: las dos condiciones de tangencia, y Pitágoras da la
    única distancia horizontal que las cumple. Es la cuenta que usaba el bulto del riel.
  */
  const lipDistance = Math.sqrt((Rc + rf) ** 2 - (h / 2 + rf) ** 2)
  const lipX = Rc + lipDistance

  /* Donde el labio se funde con el redondel: sobre la recta que une los dos centros. */
  const tangentX = Rc + (Rc * lipDistance) / (Rc + rf)
  const tangentY = (Rc * (h / 2 + rf)) / (Rc + rf)

  /* La diagonal, como dirección unitaria: baja hacia la izquierda. */
  const slantLength = Math.hypot(slant, h)
  const slantDir: Point = [-slant / slantLength, h / slantLength]

  const topRight = cornerCut([width, top], [1, 0], slantDir, rr)
  const bottomRight = cornerCut([width - slant, bottom], slantDir, [-1, 0], rr)

  return [
    `M ${round(lipX)} ${round(top)}`,
    `H ${round(topRight.from[0])}`,
    `A ${rr} ${rr} 0 0 1 ${round(topRight.to[0])} ${round(topRight.to[1])}`,
    `L ${round(bottomRight.from[0])} ${round(bottomRight.from[1])}`,
    `A ${rr} ${rr} 0 0 1 ${round(bottomRight.to[0])} ${round(bottomRight.to[1])}`,
    `H ${round(lipX)}`,
    /* Los labios son cóncavos: su centro cae del lado de afuera, así que van al revés. */
    `A ${rf} ${rf} 0 0 0 ${round(tangentX)} ${round(centerY + tangentY)}`,
    /* El redondel, por abajo, la izquierda y arriba. Es el arco largo. */
    `A ${Rc} ${Rc} 0 1 1 ${round(tangentX)} ${round(centerY - tangentY)}`,
    `A ${rf} ${rf} 0 0 0 ${round(lipX)} ${round(top)}`,
    'Z',
  ].join(' ')
}
