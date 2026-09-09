/**
 * La tirita de barras de la tarjeta de emisiones.
 *
 * **Es una ilustración, no un gráfico**, y la diferencia importa: no hay serie de datos detrás,
 * así que no lleva ejes, ni valores, ni leyenda —dibujar cualquiera de esas tres cosas sería
 * prometer una medición que no existe—. Lo único que comunica es la forma: sube y se sostiene,
 * que es la lectura de "esto va en aumento".
 *
 * Por eso también está `aria-hidden`: a un lector de pantalla no le sirve, y el dato de verdad
 * —el cero de emisiones— está escrito al lado en texto.
 *
 * Las alturas están escritas a mano y no salen de una fórmula ni de un aleatorio: un `Math.random`
 * cambiaría el dibujo en cada render y una curva perfecta se ve sintética.
 */

/** Alturas relativas, de 0 a 1. Una por barra. */
const HEIGHTS = [
  0.18, 0.24, 0.2, 0.32, 0.38, 0.3, 0.45, 0.52, 0.44, 0.58, 0.66, 0.6, 0.72, 0.8, 0.74, 0.86, 0.94,
  0.88, 1, 0.92,
]

export default function BarSpark({ className = '' }: { className?: string }) {
  const gap = 1.4
  const width = HEIGHTS.length * (3 + gap) - gap

  return (
    <svg
      viewBox={`0 0 ${width} 34`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      {HEIGHTS.map((height, index) => (
        <rect
          key={index}
          x={index * (3 + gap)}
          /* Las barras crecen desde abajo, así que la `y` es lo que sobra arriba. */
          y={34 - height * 34}
          width={3}
          height={height * 34}
          rx={1.5}
          fill="currentColor"
          /* Las primeras más apagadas: la mirada arranca donde el dibujo es más fuerte. */
          opacity={0.35 + height * 0.65}
        />
      ))}
    </svg>
  )
}
