/**
 * El anillo de porcentaje de la tarjeta de carga.
 *
 * Se dibuja con UN círculo y dos trazos superpuestos: el de atrás completo y apagado, el de
 * adelante recortado con `stroke-dasharray`. Es la forma estándar de hacer un anillo en SVG y
 * evita tener que calcular arcos a mano —que es lo que haría falta con un `path`— por un dibujo
 * que siempre es el mismo arco.
 *
 * El truco de `dasharray` es que la "raya" mide exactamente la porción del perímetro que se
 * quiere pintar y el "espacio" mide todo el resto, así que no llega a repetirse nunca. El
 * `rotate(-90)` arranca el arco arriba en vez de a la derecha, que es donde el ojo espera que
 * empiece a contar.
 */
interface RingGaugeProps {
  /** De 0 a 100. */
  value: number
  className?: string
}

export default function RingGauge({ value, className = '' }: RingGaugeProps) {
  const radius = 42
  const circumference = 2 * Math.PI * radius

  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        opacity="0.15"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * circumference} ${circumference}`}
        transform="rotate(-90 50 50)"
      />
    </svg>
  )
}
