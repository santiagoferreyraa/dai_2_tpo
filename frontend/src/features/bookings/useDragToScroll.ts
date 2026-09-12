import { useEffect, type RefObject } from 'react'

/**
 * Hace que una tira horizontal se pueda arrastrar con el mouse, como se arrastra con el dedo.
 *
 * Un contenedor con `overflow-x: auto` scrollea arrastrando solo en pantallas táctiles. Con el
 * mouse, apretar y arrastrar selecciona texto o no hace nada, y con la barra oculta —`no-scrollbar`—
 * la tira de días parece cortada sin forma de ver el resto. La rueda ya la cubre
 * `useWheelToHorizontal`; esto cubre el gesto que la mano intenta primero.
 *
 * **Solo el mouse.** El dedo y el lápiz ya scrollean solos, y con suavidad e inercia que acá no
 * se imitan; interceptarlos empeoraría lo que en el celular ya anda bien.
 *
 * **Un arrastre no es un clic.** La tira está hecha de botones, y soltar el mouse encima de uno
 * al terminar de arrastrar lo elegiría. Pasado un umbral de unos píxeles el gesto cuenta como
 * arrastre, y el clic que el navegador dispara al soltar se descarta.
 */

/** Cuánto hay que mover el mouse para que deje de ser un clic. Absorbe el temblor de la mano. */
const DRAG_THRESHOLD_PX = 5

export function useDragToScroll(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    let pointerId: number | null = null
    let startX = 0
    let startScroll = 0
    let dragging = false

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      if (element.scrollWidth <= element.clientWidth) return

      pointerId = event.pointerId
      startX = event.clientX
      startScroll = element.scrollLeft
      dragging = false
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      const delta = event.clientX - startX

      if (!dragging) {
        if (Math.abs(delta) < DRAG_THRESHOLD_PX) return
        dragging = true
        /*
          La captura recién acá y no al apretar: capturado desde el principio, un clic simple
          sobre un día terminaría en el contenedor y no en el botón.
        */
        element.setPointerCapture(event.pointerId)
        element.style.cursor = 'grabbing'
        element.style.userSelect = 'none'
      }

      element.scrollLeft = startScroll - delta
    }

    const endDrag = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return
      pointerId = null
      element.style.cursor = ''
      element.style.userSelect = ''
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId)
    }

    /* En captura, para llegar antes que el `onClick` del botón sobre el que se soltó. */
    const onClickCapture = (event: MouseEvent) => {
      if (!dragging) return
      dragging = false
      event.preventDefault()
      event.stopPropagation()
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', endDrag)
    element.addEventListener('pointercancel', endDrag)
    element.addEventListener('click', onClickCapture, true)

    return () => {
      element.removeEventListener('pointerdown', onPointerDown)
      element.removeEventListener('pointermove', onPointerMove)
      element.removeEventListener('pointerup', endDrag)
      element.removeEventListener('pointercancel', endDrag)
      element.removeEventListener('click', onClickCapture, true)
    }
  }, [ref])
}
