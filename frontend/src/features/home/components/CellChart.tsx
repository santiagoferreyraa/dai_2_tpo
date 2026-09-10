export interface Cell {
  label: string
  value: number
}

interface CellChartProps {
  cells: Cell[]
  className?: string
}

/**
 * Barras hechas de cuadraditos, como la grilla de contribuciones de GitHub.
 *
 * **La gracia es que, casi siempre, un cuadrito es UNA unidad.** Mientras la columna más alta
 * entre en el alto de la grilla, la escala es uno a uno: se pueden contar los conectores de un
 * tramo con el dedo, sin leer el número. Eso es lo que una barra maciza no da —dos barras de alto
 * parecido son indistinguibles— y es la razón de dibujarlo así y no relleno.
 *
 * Pasado ese tope la escala se vuelve proporcional, como cualquier gráfico, y ahí el número de
 * arriba deja de ser un adorno: es la única forma de saber el valor exacto. Por eso está siempre,
 * aunque cuando se puedan contar los cuadritos parezca redundante.
 */

/**
 * Cuántas filas tiene la grilla como mucho.
 *
 * Es el punto donde se pierde la escala de uno a uno. Diez entra cómodo en una tarjeta y cubre de
 * sobra la red de hoy; subirlo achica los cuadritos hasta que dejan de contarse, que es
 * justamente lo que hace que este gráfico valga la pena.
 */
const MAX_ROWS = 10

export default function CellChart({ cells, className = '' }: CellChartProps) {
  const top = Math.max(...cells.map((cell) => cell.value), 0)
  const rows = Math.min(Math.max(top, 1), MAX_ROWS)

  return (
    <div className={`flex items-end gap-1.5 ${className}`}>
      {cells.map((cell) => {
        /*
          Al menos un cuadrito si el valor no es cero: un tramo con un conector tiene que verse
          distinto de uno vacío, y redondeando hacia abajo los dos darían cero.
        */
        const filled =
          cell.value === 0 ? 0 : Math.max(1, Math.round((cell.value / Math.max(top, 1)) * rows))

        return (
          <div key={cell.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <span className="text-text text-[11px] font-bold">{cell.value}</span>

            {/*
              `flex-col-reverse` apila desde abajo, que es de donde crecen las barras. La
              alternativa era dar vuelta el arreglo antes de dibujarlo, y entonces el índice
              dejaría de coincidir con la altura.

              Los cuadritos tienen tamaño FIJO y no el ancho de su columna. Atados al ancho, en
              una tarjeta angosta salían enormes y diez filas estiraban el recuadro hasta
              desbordarlo; y en una ancha se convertían en ladrillos que ya no se leen como una
              grilla. Ocho píxeles se cuentan bien y no dependen de dónde caiga el gráfico.
            */}
            <div className="flex flex-col-reverse gap-[3px]">
              {Array.from({ length: rows }, (_, row) => (
                <span
                  key={row}
                  className={`h-2 w-2 rounded-[2px] ${
                    row < filled ? 'brand-fill' : 'bg-text-muted/20'
                  }`}
                />
              ))}
            </div>

            <span className="text-text-muted truncate text-[10px]">{cell.label}</span>
          </div>
        )
      })}
    </div>
  )
}
