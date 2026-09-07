import { useEffect, useRef } from 'react'

/**
 * Hace que la rueda del mouse scrollee de costado en las tiras horizontales.
 *
 * Un contenedor con `overflow-x: auto` se scrollea solo con el dedo, con una barra o con
 * Shift + rueda. Con un mouse común la rueda tira para abajo y la tira no se mueve: parece
 * que el contenido cortado no se puede alcanzar, sobre todo ahora que la barra está oculta.
 *
 * El listener se agrega a mano y no con `onWheel` porque hace falta `passive: false`: sin
 * eso el navegador ignora el `preventDefault` y la página scrollea igual, al mismo tiempo.
 */
export function useWheelToHorizontal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const onWheel = (event: WheelEvent) => {
      /* Un gesto ya horizontal (trackpad) lo maneja el navegador, y mejor. */
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      /* Si no hay nada de más que mostrar, la rueda sigue siendo de la página. */
      if (element.scrollWidth <= element.clientWidth) return

      event.preventDefault()
      element.scrollLeft += event.deltaY
    }

    element.addEventListener('wheel', onWheel, { passive: false })
    return () => element.removeEventListener('wheel', onWheel)
  }, [])

  return ref
}
