export interface DonutSegment {
  label: string
  value: number
  /** Cualquier color CSS. Se pasa desde afuera para que el gráfico no conozca la paleta. */
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  className?: string
}

/**
 * Anillo partido en tramos, uno por categoría.
 *
 * Se dibuja con un círculo por tramo, todos del mismo radio y superpuestos, y cada uno recortado
 * con `stroke-dasharray` para que se vea solo su pedazo. Es la forma estándar de hacer esto en
 * SVG y evita calcular arcos a mano, que es lo que haría falta con `path`: cada tramo necesitaría
 * sus dos puntos y la bandera de arco largo.
 *
 * El truco tiene dos partes. `dasharray` fija cuánto se pinta y cuánto se saltea —la raya mide la
 * porción del perímetro que le toca y el espacio mide todo el resto, así que nunca se repite—, y
 * `dashoffset` corre el arranque hasta donde terminó el tramo anterior. El `rotate(-90)` empieza
 * arriba en vez de a la derecha, que es donde el ojo espera que arranque a contar.
 *
 * `aria-hidden` porque no aporta nada: al lado de este dibujo va siempre la lista de categorías
 * con sus números, que es la que un lector de pantalla lee.
 */
export default function DonutChart({ segments, className = '' }: DonutChartProps) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  /* Sin datos no hay proporción posible: se dibuja el anillo vacío en vez de dividir por cero. */
  if (total === 0) {
    return (
      <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          opacity="0.15"
        />
      </svg>
    )
  }

  /*
    Cada tramo necesita saber cuánto ocupan los anteriores para arrancar donde ellos terminan. Se
    resuelve antes de dibujar, acumulando sobre el arreglo, y no con una variable que se va
    sumando adentro del `map`: una variable mutada durante el render es la clase de cosa que
    funciona hasta que React decide renderizar dos veces.
  */
  const arcs = segments.reduce<{ segment: DonutSegment; fraction: number; offset: number }[]>(
    (built, segment) => {
      const previous = built.at(-1)
      const offset = previous === undefined ? 0 : previous.offset + previous.fraction
      return [...built, { segment, fraction: segment.value / total, offset }]
    },
    [],
  )

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="12"
        opacity="0.12"
      />

      {arcs.map((arc) => (
        <circle
          key={arc.segment.label}
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={arc.segment.color}
          strokeWidth="12"
          /*
            Sin `strokeLinecap="round"`: con tramos pegados uno al lado del otro, las puntas
            redondas de cada uno se montan sobre el vecino y el anillo queda con escalones.
          */
          strokeDasharray={`${arc.fraction * circumference} ${circumference}`}
          strokeDashoffset={-arc.offset * circumference}
          transform="rotate(-90 50 50)"
        />
      ))}
    </svg>
  )
}
