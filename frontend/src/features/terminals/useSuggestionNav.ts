import { useState, type KeyboardEvent } from 'react'

/**
 * El teclado y el estado de abierto/cerrado de una lista de sugerencias.
 *
 * Existe porque hay dos buscadores que despliegan la misma lista y no comparten nada más: el de
 * la franja de arriba, que lleva al mapa, y el del mapa en celular, que elige una estación. Lo
 * único igual entre los dos es cómo se recorre la lista, y eso es lo que está acá.
 *
 * **La lista se cierra sin borrar el texto.** Son dos cosas distintas y hay que poder hacer una
 * sin la otra: elegida una sugerencia, el texto sigue siendo el filtro que explica lo que se ve
 * en pantalla, pero la lista ya cumplió y sobra —encima, en el mapa, tapa justo lo que se acaba
 * de elegir—. Por eso `dismissed` es aparte del texto, que lo guarda quien llama.
 *
 * Enter no se resuelve acá: se avisa con `onEnter`, con la sugerencia resaltada o `null` si no
 * hay ninguna. Los dos buscadores hacen cosas distintas con eso y ninguna es la del otro. Lo que
 * sí es igual en los dos —y por eso queda acá— es que Enter cierra la lista: la búsqueda terminó,
 * y lo que venga después se ve en la pantalla, no en el desplegable.
 */
export function useSuggestionNav<T>(matches: T[], onEnter: (picked: T | null) => void) {
  const [highlighted, setHighlighted] = useState(-1)
  const [dismissed, setDismissed] = useState(false)

  const open = matches.length > 0 && !dismissed

  /** Cerrar la lista dejando el texto donde está. */
  const dismiss = () => {
    setDismissed(true)
    setHighlighted(-1)
  }

  /** Al escribir vuelve a abrirse y se suelta el resaltado: la lista de abajo ya es otra. */
  const reopen = () => {
    setDismissed(false)
    setHighlighted(-1)
  }

  /*
   * Las flechas mueven el resaltado y Escape cierra. Sin esto la lista sería alcanzable solo con
   * el mouse o el dedo, que para quien navega con teclado equivale a que no exista.
   *
   * Enter se atiende acá y no con el `submit` de un formulario: uno de los dos buscadores ni
   * siquiera está adentro de uno, y el otro no tiene botón de envío, con lo que dependería del
   * envío implícito del navegador, que se apaga solo en cuanto alguien agregue un segundo campo.
   */
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      const picked = highlighted >= 0 ? (matches[highlighted] ?? null) : null
      dismiss()
      onEnter(picked)
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
      dismiss()
    }
  }

  return { open, highlighted, setHighlighted, dismiss, reopen, onKeyDown }
}
