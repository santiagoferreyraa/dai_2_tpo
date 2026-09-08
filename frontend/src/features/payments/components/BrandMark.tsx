import type { CardBrand } from '../types'

interface BrandMarkProps {
  brand: CardBrand | undefined
  /** Alto en píxeles. El ancho sale solo de la proporción de cada marca. */
  height?: number
}

/**
 * El logo de la marca, dibujado en SVG.
 *
 * **Dibujado y no una imagen**, por tres motivos que se acumulan. Un `<img>` a un CDN es una
 * dependencia de red para pintar un formulario que ya está en pantalla —y en producción, un
 * origen más que autorizar—. Un archivo en `public/` son cuatro binarios que hay que versionar
 * y que no escalan sin verse borrosos. Y esto pesa unos pocos cientos de bytes, hereda el
 * color del texto donde hace falta y se ve nítido a cualquier tamaño.
 *
 * Son representaciones reconocibles, no los logos oficiales: alcanzan para que alguien
 * identifique su tarjeta de un vistazo, que es todo lo que esta pantalla necesita.
 */
export default function BrandMark({ brand, height = 20 }: BrandMarkProps) {
  if (brand === 'MASTERCARD') {
    return (
      <svg
        viewBox="0 0 48 30"
        height={height}
        role="img"
        aria-label="Mastercard"
        style={{ width: (height * 48) / 30 }}
      >
        {/* Los dos círculos que se pisan. El del medio es la superposición. */}
        <circle cx="18" cy="15" r="13" fill="#eb001b" />
        <circle cx="30" cy="15" r="13" fill="#f79e1b" />
        <path d="M24 5.2a12.9 12.9 0 0 0 0 19.6 12.9 12.9 0 0 0 0-19.6Z" fill="#ff5f00" />
      </svg>
    )
  }

  if (brand === 'AMEX') {
    return (
      <svg
        viewBox="0 0 60 30"
        height={height}
        role="img"
        aria-label="American Express"
        style={{ width: (height * 60) / 30 }}
      >
        <rect width="60" height="30" rx="4" fill="#016fd0" />
        <text
          x="30"
          y="13"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          AMERICAN
        </text>
        <text
          x="30"
          y="23"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="8"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          EXPRESS
        </text>
      </svg>
    )
  }

  if (brand === 'VISA') {
    return (
      <svg
        viewBox="0 0 60 20"
        height={height}
        role="img"
        aria-label="Visa"
        style={{ width: (height * 60) / 20 }}
      >
        <text
          x="30"
          y="16"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="18"
          fontWeight="700"
          fontStyle="italic"
          letterSpacing="1"
          fontFamily="system-ui, sans-serif"
        >
          VISA
        </text>
      </svg>
    )
  }

  /*
   * Sin marca todavía. Se dibuja un hueco del mismo tamaño en vez de no dibujar nada: si el
   * logo apareciera de la nada, todo lo que tiene al lado se correría al escribir el primer
   * dígito. Reservando el lugar, lo único que cambia es el logo.
   */
  return (
    <span
      aria-hidden="true"
      className="inline-block rounded border border-current opacity-25"
      style={{ height, width: (height * 60) / 30 }}
    />
  )
}
