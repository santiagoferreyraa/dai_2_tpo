import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'

import StationSearch from '@/features/terminals/components/StationSearch'
import { fetchAllStations } from '@/features/terminals/data/allStations'
import { matchesQuery } from '@/features/terminals/format'
import type { StationResult } from '@/features/terminals/types'

/**
 * El buscador de estaciones fuera del mapa, con sugerencias.
 *
 * **Envuelve el buscador del mapa, no lo reimplementa.** `StationSearch` sabe dibujarse, plegarse
 * y limpiarse, pero por sí solo filtra una lista que le pasan; acá no hay lista, así que este
 * componente pone las dos cosas que faltan: de dónde salen las estaciones y a dónde se va con lo
 * elegido.
 *
 * Hay dos maneras de salir, y hacen cosas distintas a propósito. Elegir una sugerencia lleva al
 * mapa con ESA estación; apretar Enter sin elegir ninguna lleva al mapa con el texto tal cual,
 * que puede dar varias. Quien ya vio la que buscaba no tiene por qué pasar por una lista de una
 * sola fila, y quien está explorando no tiene por qué elegir a ciegas.
 *
 * La búsqueda viaja en la dirección (`?q=`) y no en el estado del router: así el resultado se
 * puede compartir, guardar en favoritos y recargar. Del otro lado la levanta `StationsMapPage`.
 */

/** Cuántas sugerencias se muestran. Más que esto deja de ser una ayuda y pasa a ser la pantalla. */
const MAX_SUGGESTIONS = 6

export default function SearchBox({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [stations, setStations] = useState<StationResult[]>([])
  const [highlighted, setHighlighted] = useState(-1)

  const listboxId = useId()

  /*
   * Las estaciones se piden con la primera letra, no al montar. Este buscador está en todas las
   * pantallas, y la enorme mayoría de las visitas no lo usan: traer la red entera en cada carga
   * sería pagar por adelantado algo que casi nunca se necesita.
   *
   * Quién la pide no importa: `fetchAllStations` recuerda la respuesta, así que abrir el buscador
   * cinco veces sigue siendo una sola consulta.
   */
  useEffect(() => {
    if (query === '' || stations.length > 0) return

    let cancelled = false
    fetchAllStations()
      .then((rows) => {
        if (!cancelled) setStations(rows)
      })
      .catch(() => {
        /*
          En silencio: esto es una ayuda para escribir, no la pantalla de resultados. Si el backend
          no contesta, el campo sigue funcionando y Enter sigue llevando al mapa, que ahí sí muestra
          el error.
        */
      })

    return () => {
      cancelled = true
    }
  }, [query, stations.length])

  const matches =
    query.trim() === ''
      ? []
      : stations.filter((station) => matchesQuery(station, query)).slice(0, MAX_SUGGESTIONS)

  const open = matches.length > 0

  const goToMap = (search: string) => {
    const trimmed = search.trim()
    /* Vacía lleva al mapa sin filtro, que es lo que corresponde a una búsqueda sin términos. */
    void navigate(
      trimmed === '' ? '/stations/map' : `/stations/map?q=${encodeURIComponent(trimmed)}`,
    )
    /*
      Y se vacía el campo. La búsqueda ya viajó en la dirección y del otro lado la muestra el
      buscador del mapa: si acá quedara el texto, quedaría también la lista de sugerencias, abierta
      y tapando el mapa al que se acaba de llegar.
    */
    setQuery('')
    setHighlighted(-1)
  }

  /* Con una sugerencia resaltada gana ella; si no, vale lo escrito. */
  const submitCurrent = () => {
    goToMap(highlighted >= 0 ? matches[highlighted].name : query)
  }

  /*
   * Las flechas mueven el resaltado y Escape cierra. Sin esto la lista sería alcanzable solo con
   * el mouse, que para quien navega con teclado equivale a que no exista.
   *
   * Va en el formulario y no en el campo porque el campo lo dibuja otro componente: las teclas
   * suben desde él igual.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    /*
      Enter se atiende acá y no con el `submit` del formulario. Un formulario sin botón de envío
      depende del envío implícito del navegador, que es frágil: alcanza con que mañana alguien
      agregue un segundo campo para que deje de dispararse. Con la tecla a la vista, el buscador
      hace lo mismo sin depender de esa regla.
    */
    if (event.key === 'Enter') {
      event.preventDefault()
      submitCurrent()
      return
    }

    if (!open) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((current) => (current + 1) % matches.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((current) => (current <= 0 ? matches.length - 1 : current - 1))
    } else if (event.key === 'Escape') {
      setHighlighted(-1)
      setQuery('')
    }
  }

  const handleChange = (value: string) => {
    setQuery(value)
    /* Al escribir se suelta el resaltado: la lista de abajo ya no es la misma. */
    setHighlighted(-1)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submitCurrent()
      }}
      onKeyDown={handleKeyDown}
      /* `relative` para colgar la lista, que se posiciona contra este contenedor. */
      className={`relative ${className}`}
    >
      {/*
        El buscador trae el borde y el fondo del mapa, sin esquinas redondeadas porque allá va
        pegado al borde de la pantalla. Se las pone este envoltorio, con `overflow-hidden` para que
        el recorte alcance también a ese fondo.
      */}
      <div className="overflow-hidden rounded-full">
        <StationSearch
          value={query}
          onChange={handleChange}
          combobox={{
            listboxId,
            expanded: open,
            activeOptionId: highlighted >= 0 ? `${listboxId}-${String(highlighted)}` : undefined,
          }}
        />
      </div>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Estaciones que coinciden"
          className="glass-panel absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl py-1"
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
                  `onMouseDown` y no `onClick`: el clic llega DESPUÉS de que el campo pierde el
                  foco, y para entonces la lista ya se cerró y este botón no existe. Bajando el
                  mouse se adelanta a ese cierre. Es el mismo motivo por el que la cruz de limpiar
                  del buscador usa `onMouseDown`.
                */
                onMouseDown={(event) => {
                  event.preventDefault()
                  goToMap(station.name)
                }}
                onMouseEnter={() => setHighlighted(index)}
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
      )}
    </form>
  )
}
