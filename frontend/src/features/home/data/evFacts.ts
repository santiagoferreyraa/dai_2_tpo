/**
 * Curiosidades sobre autos eléctricos, para el recuadro que ocupa el lugar del tiempo de carga
 * cuando no hay sesión.
 *
 * **Por qué existe esta lista y no un texto fijo.** El recuadro al que reemplaza muestra un dato
 * calculado y distinto en cada estación; uno con una sola frase escrita a mano se leería como un
 * cartel pegado en un hueco. Con varias, la portada tiene algo nuevo para decir cada vez que
 * alguien vuelve sin entrar, que es exactamente el caso que este recuadro atiende.
 *
 * **Ninguna depende de datos del sistema, y esa es la condición para estar acá.** Todo lo que se
 * afirma es sobre los autos eléctricos en general —física, historia, mecánica—, así que no hay
 * nada que el backend pueda contradecir ni que quede viejo cuando cambie la red de estaciones.
 *
 * El formato es el mismo del recuadro que reemplaza: un titular con una parte resaltada y un
 * renglón debajo que lo sostiene. `highlight` es lo que va en verde, y se escribe aparte en vez
 * de marcarlo dentro del texto para no meter etiquetas en una lista de datos.
 */

export interface EvFact {
  /** Lo que va antes de la parte resaltada. Puede terminar sin espacio: lo pone el componente. */
  lead: string
  /** La parte en verde: el número o la palabra que hace de dato. */
  highlight: string
  /** Lo que va después. Vacío cuando la frase termina en el resaltado. */
  tail: string
  /** El renglón de abajo, que explica o matiza el titular. */
  detail: string
}

export const EV_FACTS: readonly EvFact[] = [
  {
    lead: 'Un motor eléctrico aprovecha más del',
    highlight: '85%',
    tail: ' de la energía que recibe',
    detail: 'Uno de combustión ronda el 30%: el resto se va en calor por el caño de escape.',
  },
  {
    lead: 'Frenar también',
    highlight: 'carga',
    tail: ' la batería',
    detail:
      'El freno regenerativo usa el motor al revés y devuelve parte de la energía del envión.',
  },
  {
    lead: 'El empuje máximo está disponible',
    highlight: 'desde el arranque',
    tail: '',
    detail: 'Un motor eléctrico no necesita subir de vueltas, y por eso tampoco necesita caja.',
  },
  {
    lead: 'El primer auto en pasar los',
    highlight: '100 km/h',
    tail: ' fue eléctrico',
    detail:
      'Fue La Jamais Contente, en 1899, casi veinte años antes de que se popularizara la nafta.',
  },
  {
    lead: 'En 1900, cerca de un',
    highlight: 'tercio',
    tail: ' de los autos de Estados Unidos era eléctrico',
    detail: 'Perdieron contra la nafta por la autonomía, que es la misma discusión de hoy.',
  },
  {
    lead: 'El tren motriz tiene alrededor de',
    highlight: '20',
    tail: ' piezas móviles',
    detail:
      'Uno de combustión tiene cientos, y de ahí sale buena parte de lo que no hay que mantener.',
  },
  {
    lead: 'Una batería retirada del auto todavía conserva cerca del',
    highlight: '70%',
    tail: ' de su capacidad',
    detail: 'Poco para mover un auto, suficiente para acumular energía quieta durante años.',
  },
] as const
