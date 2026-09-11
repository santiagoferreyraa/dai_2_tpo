import type { StationResult } from '../types'

/**
 * La lista de estaciones que coinciden, colgada debajo de un buscador.
 *
 * **Se posiciona sola contra el campo**, así que quien la use tiene que ser `relative`. Es a
 * propósito: los dos buscadores que la despliegan la quieren en el mismo lugar —pegada abajo,
 * del mismo ancho, por encima de lo que haya detrás— y dejar eso afuera sería pedir que los dos
 * lo escriban igual y confiar en que no se separen.
 *
 * No decide nada: ni qué estaciones son, ni cuántas, ni qué pasa al elegir una. Eso cambia según
 * quién la muestre —la franja de arriba lleva al mapa, el mapa elige la estación— y es lo único
 * que de verdad los diferencia.
 */

/** Cuántas sugerencias se muestran. Más que esto deja de ser una ayuda y pasa a ser la pantalla. */
export const MAX_SUGGESTIONS = 6

interface StationSuggestionsProps {
  /** El `id` del `listbox`, el mismo que el campo anuncia en `aria-controls`. */
  listboxId: string
  matches: StationResult[]
  highlighted: number
  onHighlight: (index: number) => void
  onPick: (station: StationResult) => void
}

export default function StationSuggestions({
  listboxId,
  matches,
  highlighted,
  onHighlight,
  onPick,
}: StationSuggestionsProps) {
  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Estaciones que coinciden"
      /* z-index por encima de los 1000 que usa Leaflet: en el mapa, la lista va sobre los pines. */
      className="glass-panel absolute inset-x-0 top-full z-[1130] mt-2 overflow-hidden rounded-2xl py-1"
    >
      {matches.map((station, index) => (
        <li
          key={station.stationId}
          id={`${listboxId}-${String(index)}`}
          role="option"
          aria-selected={index === highlighted}
        >
          <button
            type="button"
            /*
              `onMouseDown` y no `onClick`: el clic llega DESPUÉS de que el campo pierde el foco,
              y para entonces el buscador ya se plegó y este botón no existe. Bajando el mouse se
              adelanta a ese cierre. Es el mismo motivo por el que la cruz de limpiar del buscador
              usa `onMouseDown`.
            */
            onMouseDown={(event) => {
              event.preventDefault()
              onPick(station)
            }}
            onMouseEnter={() => onHighlight(index)}
            className={`flex w-full flex-col px-4 py-2.5 text-left transition-colors ${
              index === highlighted ? 'bg-primary/15' : ''
            }`}
          >
            <span className="text-text truncate text-sm font-semibold">{station.name}</span>
            <span className="text-text-muted truncate text-xs">{station.address}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
