import { useCallback, useSyncExternalStore } from 'react'

/**
 * Si el ancho de la ventana cumple una media query, como valor de React.
 *
 * Hace falta porque el diseño ancho no es solo otro CSS: en el celular el detalle y el
 * formulario son paneles que suben desde abajo, y en pantalla grande son una columna fija
 * al costado. Esconder los paneles con `display: none` no alcanzaría —siguen montados,
 * bloqueando el scroll del fondo y atrapando el foco—, así que hay que decidir en JavaScript
 * cuál de los dos se renderiza.
 *
 * Usa `useSyncExternalStore` y no un `useState` con efecto: es la API que React trae para
 * leer algo de afuera, y evita el cuadro intermedio con el valor equivocado.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    /* Sin ventana (renderizado en el servidor) se asume la pantalla chica. */
    () => false,
  )
}
