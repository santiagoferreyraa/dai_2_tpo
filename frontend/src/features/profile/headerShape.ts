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
 * **El borde de arriba es RECTO de punta a punta.** El redondel no asoma por arriba: su punto
 * más alto toca esa recta y sigue de largo. No es solo estética —la tangente en el punto más
 * alto de un círculo es horizontal, así que ahí no hace falta empalme: el redondel se funde con
 * el borde sin curva intermedia, y toda la figura se apoya contra una sola línea—. Lo que asoma
 * es la panza, abajo y a la izquierda, que es donde hay lugar.
 *
 * **El remate en diagonal es el otro motivo por el que esto es un `path`.** Una caja de CSS
 * termina en noventa grados; con `clip-path` se podría cortar, pero el corte sale en punta viva
 * y el borde no lo acompaña. Acá la diagonal tiene sus dos esquinas redondeadas como cualquier
 * otra, porque son arcos tangentes a las dos rectas que se encuentran.
 *
 * El ancho se mide con un `ResizeObserver`: un `path` se escribe en píxeles.
 */

export const HEADER_SHAPE = {
  /**
   * Radio del redondel del avatar.
   *
   * De acá sale el ALTO de toda la figura, que es su diámetro: el redondel es lo más alto que
   * hay, apoyado contra el borde de arriba.
   */
  avatarRadius: 62,
  /**
   * Alto de la barra de datos.
   *
   * Menos que el diámetro, o el redondel no asomaría por abajo. La diferencia es lo único que se
   * ve de él fuera de la barra, así que de acá sale cuánta panza tiene.
   */
  barHeight: 96,
  /** Radio del labio donde el redondel vuelve a encontrarse con el borde de abajo. */
  filletRadius: 18,
  /** Radio de las esquinas del remate en diagonal. */
  cornerRadius: 16,
  /**
   * Cuánto se corre hacia adentro el borde de abajo respecto del de arriba.
   *
   * Es el remate en diagonal. Que el lado corto sea el de ABAJO no es indistinto: la diagonal
   * apunta hacia adentro y hacia el texto, así que la figura se lee en el mismo sentido en que
   * se lee el renglón.
   *
   * De este número sale además dónde va el botón de editar: a mitad de alto, la diagonal pasa
   * por `ancho - slant / 2`, y ahí se centra el botón para que quede medio adentro y medio
   * afuera. Ver `ProfileHeader`.
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
 * El contorno completo, recorrido en sentido horario desde el punto más alto del redondel.
 *
 * `width` es el de la figura entera. El alto no se pasa: lo fija el redondel.
 */
export function headerOutlinePath(width: number): string {
  const { avatarRadius: Rc, barHeight: h, filletRadius: rf, cornerRadius: rr, slant } = HEADER_SHAPE

  /*
    El único empalme de la figura, abajo a la derecha del redondel. Su centro cae por FUERA del
    borde de abajo —a `rf` de él— y a `Rc + rf` del centro del redondel: las dos condiciones de
    tangencia, y Pitágoras da la única distancia horizontal que las cumple. Que el centro vaya
    afuera es lo que lo hace cóncavo, o sea lo que rellena el ángulo entre la panza y la recta en
    vez de morderla.

    Arriba no hay empalme que calcular: el redondel toca el borde en su punto más alto, donde su
    tangente ya es horizontal.
  */
  const lipDrop = h + rf - Rc
  const lipDistance = Math.sqrt((Rc + rf) ** 2 - lipDrop ** 2)
  const lipX = Rc + lipDistance

  /* Donde el labio se funde con el redondel: sobre la recta que une los dos centros. */
  const tangentX = Rc + (Rc * lipDistance) / (Rc + rf)
  const tangentY = Rc + (Rc * lipDrop) / (Rc + rf)

  /* La diagonal, como dirección unitaria: baja hacia la izquierda. */
  const slantLength = Math.hypot(slant, h)
  const slantDir: Point = [-slant / slantLength, h / slantLength]

  const topRight = cornerCut([width, 0], [1, 0], slantDir, rr)
  const bottomRight = cornerCut([width - slant, h], slantDir, [-1, 0], rr)

  return [
    `M ${Rc} 0`,
    `H ${round(topRight.from[0])}`,
    `A ${rr} ${rr} 0 0 1 ${round(topRight.to[0])} ${round(topRight.to[1])}`,
    `L ${round(bottomRight.from[0])} ${round(bottomRight.from[1])}`,
    `A ${rr} ${rr} 0 0 1 ${round(bottomRight.to[0])} ${round(bottomRight.to[1])}`,
    `H ${round(lipX)}`,
    /* El labio es cóncavo: su centro cae del lado de afuera, así que va al revés que el resto. */
    `A ${rf} ${rf} 0 0 0 ${round(tangentX)} ${round(tangentY)}`,
    /* El redondel, por abajo, la izquierda y arriba, hasta volver al punto más alto. */
    `A ${Rc} ${Rc} 0 1 1 ${Rc} 0`,
    'Z',
  ].join(' ')
}
