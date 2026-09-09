import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import StationSearch from '@/features/terminals/components/StationSearch'

/**
 * El buscador de estaciones fuera del mapa.
 *
 * **Envuelve el buscador del mapa, no lo reimplementa.** `StationSearch` sabe dibujarse, plegarse
 * y limpiarse, pero por sí solo filtra una lista que le pasan; acá no hay lista, así que lo que
 * hace falta es un destino. El `<form>` es lo que convierte la tecla Enter en una acción, y esa
 * acción es llevar el texto al mapa.
 *
 * La búsqueda viaja en la dirección (`?q=`) y no en el estado del router: así el resultado se
 * puede compartir, guardar en favoritos y recargar. Del otro lado la levanta `StationsMapPage`.
 *
 * Existe como componente aparte porque lo usan la barra de arriba y la portada del celular, y
 * duplicar el `navigate` en los dos lugares es exactamente cómo terminan divergiendo.
 */
export default function SearchBox({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmed = query.trim()
    /* Vacía lleva al mapa sin filtro, que es lo que corresponde a una búsqueda sin términos. */
    const target =
      trimmed === '' ? '/stations/map' : `/stations/map?q=${encodeURIComponent(trimmed)}`
    void navigate(target)
  }

  return (
    /*
      El buscador trae el borde y el fondo del mapa, sin esquinas redondeadas porque allá va
      pegado al borde de la pantalla. Se las pone el envoltorio, con `overflow-hidden` para que el
      recorte alcance también a ese fondo.
    */
    <form onSubmit={handleSubmit} className={`overflow-hidden rounded-full ${className}`}>
      <StationSearch value={query} onChange={setQuery} />
    </form>
  )
}
