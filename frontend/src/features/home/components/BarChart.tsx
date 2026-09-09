export interface Bar {
  label: string
  value: number
}

interface BarChartProps {
  bars: Bar[]
  className?: string
}

/**
 * Barras verticales con su rótulo debajo.
 *
 * A diferencia de la tirita decorativa que había antes, esto sí es un gráfico: las alturas salen
 * de los datos y hay una escala detrás. Por eso lleva rótulos —sin ellos, unas barras de distinta
 * altura no dicen de qué hablan— y por eso no lleva eje: con cinco tramos y el número escrito
 * encima de cada barra, un eje solo agregaría tinta.
 *
 * Se dibuja con `div`s y no con SVG. Un SVG obligaría a estirar el texto de los rótulos junto con
 * el dibujo o a posicionarlos a mano en coordenadas; con caja y `flex`, el navegador acomoda las
 * barras y los rótulos solo, y el tipo de letra sale del mismo lugar que el resto de la pantalla.
 */
export default function BarChart({ bars, className = '' }: BarChartProps) {
  /* La barra más alta manda la escala. El mínimo de 1 evita dividir por cero con todo en cero. */
  const top = Math.max(1, ...bars.map((bar) => bar.value))

  return (
    <div className={`flex items-end gap-2 ${className}`}>
      {bars.map((bar) => (
        <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="text-text text-[11px] font-bold">{bar.value}</span>

          {/*
            El riel gris de atrás le da altura a la columna aunque su barra valga cero: sin él,
            un tramo vacío haría colapsar su columna y las demás quedarían desalineadas.
          */}
          <div className="bg-text-muted/15 flex h-20 w-full items-end overflow-hidden rounded-md">
            <div
              className="bg-primary w-full rounded-md transition-[height] duration-500"
              style={{ height: `${Math.max((bar.value / top) * 100, bar.value > 0 ? 8 : 0)}%` }}
            />
          </div>

          <span className="text-text-muted truncate text-[10px]">{bar.label}</span>
        </div>
      ))}
    </div>
  )
}
