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
 *
 * **En celular empieza plegado**, como una burbuja con la lupa, y se despliega al tocarlo. El
 * motivo es el espacio: en una pantalla angosta la barra entera se come el ancho del mapa para
 * mostrar un campo vacío que la mayoría de las veces no se usa. En pantalla ancha no hay ese
 * problema, así que ahí va siempre desplegado y `collapsible` viene en `false`.
 */

import { useEffect, useRef, useState } from 'react'

interface StationSearchProps {
  value: string
  onChange: (value: string) => void
  /** Si puede plegarse a una burbuja cuando está vacío y sin foco. */
  collapsible?: boolean
}

/** La lupa. Se dibuja igual plegado y desplegado, así que se escribe una vez. */
function SearchIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

export default function StationSearch({
  value,
  onChange,
  collapsible = false,
}: StationSearchProps) {
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /* Al desplegarse toma el foco: si no, hay que tocar dos veces para empezar a escribir. */
  useEffect(() => {
    if (expanded) inputRef.current?.focus()
  }, [expanded])

  const collapsed = collapsible && !expanded && value === ''

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Buscar estación por nombre o dirección"
        aria-expanded={false}
        className="border-border bg-surface/95 text-text-muted hover:text-text focus-visible:outline-primary flex h-12 w-12 items-center justify-center rounded-full border shadow-lg backdrop-blur transition-colors focus-visible:outline-2"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="border-border bg-surface/95 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur">
      <SearchIcon className="text-text-muted h-5 w-5 shrink-0" />

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        /*
          Se repliega al perder el foco SOLO si quedó vacío. Con texto adentro no: el texto es
          un filtro activo sobre lo que se ve en el mapa, y esconderlo dejaría media docena de
          estaciones ocultas sin nada en pantalla que explique por qué.
        */
        onBlur={() => setExpanded(false)}
        // type="text" y no type="search": el segundo agrega una cruz propia del navegador, con
        // el estilo de cada uno, que convive mal con la que dibujamos abajo.
        aria-label="Buscar estación por nombre o dirección"
        placeholder="Buscar estación o dirección"
        className="text-text placeholder:text-text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
      />

      {value !== '' && (
        <button
          type="button"
          /*
            onMouseDown y no onClick: el clic dispara después del blur del campo, y para
            entonces el buscador ya se plegó y este botón no existe. Bajando el mouse se
            adelanta al blur.
          */
          onMouseDown={(event) => {
            event.preventDefault()
            onChange('')
            inputRef.current?.focus()
          }}
          aria-label="Limpiar búsqueda"
          className="text-text-muted hover:text-text shrink-0 text-sm leading-none"
        >
          ✕
        </button>
      )}
    </div>
  )
}
