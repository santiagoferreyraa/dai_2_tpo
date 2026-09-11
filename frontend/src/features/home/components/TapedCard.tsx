/**
 * Una tarjeta tapada: el contenido se ve borroso detrás y lo único nítido es la cinta cruzada.
 *
 * Es el tratamiento de "esto todavía no está" de la portada, y existe como componente porque lo
 * usan dos recuadros. Copiarlo habría dejado el desenfoque, el `aria-hidden` y la cinta escritos
 * dos veces, con dos oportunidades de que se separen.
 *
 * ─── Por qué el desenfoque va sobre TODO ───
 *
 * Con el título legible y solo el contenido borroso, la tarjeta afirma una cosa y tapa otra: hay
 * que leer dos niveles distintos de "esto no se puede usar". Borroso entero dice una sola cosa
 * —hay algo acá, no está disponible— y la cinta explica por qué.
 *
 * Y hay un motivo más fuerte: **lo que está detrás no siempre es de mentira**. En Actividad el
 * gráfico es inventado y el desenfoque es lo que impide que afirme valores; en el recuadro de
 * compatibilidad los números son reales y el desenfoque es lo que dice que el recuadro está sin
 * decidir. En los dos casos el efecto es el mismo: nada de lo que hay detrás se puede leer, así
 * que nada de lo que hay detrás está prometiendo nada.
 *
 * ─── Accesibilidad ───
 *
 * Todo el bloque de atrás va `aria-hidden` y el mensaje real viaja en `label`. Para quien no ve
 * la pantalla, el desenfoque no comunica nada: anunciar un título que en realidad está tapado
 * sería prometer una función que no se puede usar. Y la cinta tampoco se anuncia — dice
 * "próximamente" ocho veces por una razón visual.
 */

import type { ReactNode } from 'react'

/**
 * El texto de la cinta, repetido hasta pasarse de largo por los dos costados.
 *
 * Ocho veces y no las justas: la cinta va rotada y sobresale del recuadro, así que cuánto texto
 * entra depende del ancho de la tarjeta, que cambia con la pantalla. De más se recorta contra el
 * borde —que es lo que tiene que pasar— y de menos dejaría un hueco verde en una punta.
 */
const TAPE_TEXT = 'Próximamente · '.repeat(8)

interface TapedCardProps {
  /** Lo que se ve borroso detrás de la cinta. Nada de esto se anuncia. */
  children: ReactNode
  /** Lo ÚNICO que se anuncia del recuadro: qué va a ir acá, en una frase. */
  label: string
  /**
   * Inclinación de la cinta.
   *
   * Es un parámetro y no una constante porque dos tarjetas tapadas pueden terminar una al lado
   * de la otra, y con el mismo ángulo las dos cintas se alinean y se leen como una sola que
   * cruza la fila entera. Inclinaciones distintas —y mejor todavía, en sentidos opuestos— las
   * devuelven a ser dos pedazos de cinta pegados por separado, que es lo que son.
   */
  tapeAngle?: string
  className?: string
}

export default function TapedCard({
  children,
  label,
  tapeAngle = '-11deg',
  className = '',
}: TapedCardProps) {
  return (
    <article
      className={`glass-panel relative min-h-[12rem] overflow-hidden rounded-3xl ${className}`}
    >
      {/*
        `select-none` además del desenfoque: no es texto que alguien vaya a querer copiar, es la
        forma de lo que va a ir acá. Y `pointer-events-none` para que nada de atrás sea clickeable
        —hay enlaces y botones posibles ahí abajo que no tienen que responder—.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none flex-col justify-between p-6 blur-[4px]"
      >
        {children}
      </div>

      <p className="sr-only">{label}</p>

      <div
        className="taped-card__tape"
        aria-hidden="true"
        style={{ '--tape-angle': tapeAngle } as React.CSSProperties}
      >
        <span className="taped-card__text">{TAPE_TEXT}</span>
      </div>
    </article>
  )
}
