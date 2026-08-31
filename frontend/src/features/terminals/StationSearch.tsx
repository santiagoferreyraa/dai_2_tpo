/**
 * Buscador de estaciones por nombre o dirección.
 *
 * Filtra lo que ya está en pantalla; no vuelve a consultar al backend. Cuando entre la
 * búsqueda por viewport habrá que decidir si esto pasa a ser un criterio más del servidor —hoy
 * `SearchCriteria` no tiene campo de texto— o si sigue filtrando del lado del cliente sobre los
 * resultados que devolvió el radio.
 *
 * Sin debounce a propósito: filtra un puñado de estaciones que ya están en memoria, y esperar
 * a que el usuario deje de escribir solo agregaría una demora que no compra nada. El día que
 * la consulta viaje al servidor, el debounce va con ella.
 */

interface StationSearchProps {
  value: string
  onChange: (value: string) => void
}

export default function StationSearch({ value, onChange }: StationSearchProps) {
  return (
    <div className="border-border bg-surface/95 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-text-muted h-5 w-5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        // type="text" y no type="search": el segundo agrega una cruz propia del navegador, con
        // el estilo de cada uno, que convive mal con la que dibujamos abajo.
        aria-label="Buscar estación por nombre o dirección"
        placeholder="Buscar estación o dirección"
        className="text-text placeholder:text-text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
      />

      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="text-text-muted hover:text-text shrink-0 text-sm leading-none"
        >
          ✕
        </button>
      )}
    </div>
  )
}
