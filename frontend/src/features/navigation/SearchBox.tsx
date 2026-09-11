import { useEffect, useId, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import StationSearch from '@/features/terminals/components/StationSearch'
import StationSuggestions, {
  MAX_SUGGESTIONS,
} from '@/features/terminals/components/StationSuggestions'
import { fetchAllStations } from '@/features/terminals/data/allStations'
import { matchesQuery } from '@/features/terminals/format'
import { useSuggestionNav } from '@/features/terminals/useSuggestionNav'
import type { StationResult } from '@/features/terminals/types'

/**
 * El buscador de estaciones de la franja de arriba, con sugerencias.
 *
 * **Envuelve el buscador del mapa, no lo reimplementa.** `StationSearch` sabe dibujarse y
 * limpiarse, pero por sí solo filtra una lista que le pasan; acá no hay lista, así que este
 * componente pone las dos cosas que faltan: de dónde salen las estaciones y a dónde se va con lo
 * elegido.
 *
 * **De tablet para arriba es el ÚNICO buscador**: el mapa ya no dibuja el suyo, que quedaba a
 * cuatro centímetros de este y hacía dudar de cuál era cuál. Eso le agrega una obligación que
 * antes no tenía: estando en el mapa, el texto acá es el filtro de allá, así que se copia a la
 * dirección con cada tecla y el mapa refiltra en vivo, como lo hacía su campo propio. Fuera del
 * mapa no, porque no hay nada que filtrar todavía.
 *
 * Hay dos maneras de salir, y hacen cosas distintas a propósito. Elegir una sugerencia lleva al
 * mapa con ESA estación; apretar Enter sin elegir ninguna lleva con el texto tal cual, que puede
 * dar varias. Quien ya vio la que buscaba no tiene por qué pasar por una lista de una sola fila,
 * y quien está explorando no tiene por qué elegir a ciegas.
 *
 * La búsqueda viaja en la dirección (`?q=`) y no en el estado del router: así el resultado se
 * puede compartir, guardar en favoritos y recargar. Del otro lado la levanta `StationsMapPage`.
 */

const MAP_PATH = '/stations/map'

export default function SearchBox({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [stations, setStations] = useState<StationResult[]>([])

  const listboxId = useId()

  /*
   * El texto que dice la dirección, que fuera del mapa es ninguno.
   *
   * Se copia al campo DURANTE el render y no en un efecto —el patrón que recomienda React para
   * el estado que se deriva de algo de afuera, el mismo que usa `StationsMapPage`—, y se compara
   * contra la última dirección vista y no contra `query` a secas: copiándolo siempre, borrar el
   * texto a mano lo repondría desde la dirección en el render siguiente.
   *
   * Sirve para dos cosas: llegar al mapa con un `?q=` de un enlace compartido deja el campo
   * mostrando lo que se está filtrando, y salir del mapa lo vacía, que es lo que corresponde
   * cuando ya no hay nada filtrado.
   */
  const onMap = location.pathname === MAP_PATH
  const urlQuery = onMap ? (new URLSearchParams(location.search).get('q') ?? '') : ''

  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery)

  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

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

  const goToMap = (search: string) => {
    const trimmed = search.trim()
    setQuery(trimmed)
    /*
      Vacía lleva al mapa sin filtro, que es lo que corresponde a una búsqueda sin términos.

      Estando ya en el mapa se reemplaza la entrada del historial en vez de agregar una: cada
      búsqueda es un ajuste del mismo destino, y apiladas obligarían a apretar "atrás" una vez
      por tecleo para salir de la pantalla.
    */
    const to = trimmed === '' ? MAP_PATH : `${MAP_PATH}?q=${encodeURIComponent(trimmed)}`
    void navigate(to, { replace: onMap })
  }

  /* Con una sugerencia resaltada gana ella; si no, vale lo escrito. */
  const nav = useSuggestionNav(matches, (picked) => {
    goToMap(picked === null ? query : picked.name)
  })

  const handleChange = (value: string) => {
    setQuery(value)
    nav.reopen()
    /* En el mapa el campo filtra en vivo, y el filtro es la dirección. Ver el encabezado. */
    if (onMap) {
      const to = value.trim() === '' ? MAP_PATH : `${MAP_PATH}?q=${encodeURIComponent(value)}`
      void navigate(to, { replace: true })
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
      }}
      /* Las teclas suben desde el campo, que lo dibuja otro componente. */
      onKeyDown={nav.onKeyDown}
      /* `relative` para colgar la lista, que se posiciona contra este contenedor. */
      className={`relative ${className}`}
    >
      <StationSearch
        value={query}
        onChange={handleChange}
        combobox={{
          listboxId,
          expanded: nav.open,
          activeOptionId:
            nav.highlighted >= 0 ? `${listboxId}-${String(nav.highlighted)}` : undefined,
        }}
      />

      {nav.open && (
        <StationSuggestions
          listboxId={listboxId}
          matches={matches}
          highlighted={nav.highlighted}
          onHighlight={nav.setHighlighted}
          onPick={(station) => {
            goToMap(station.name)
            nav.dismiss()
          }}
        />
      )}
    </form>
  )
}
