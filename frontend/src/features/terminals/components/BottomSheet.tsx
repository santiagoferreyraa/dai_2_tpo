import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Panel que entra desde abajo y se cierra arrastrándolo hacia abajo, tocando fuera o con Escape.
 *
 * Lo usan las tres pantallas de la feature (detalle, alta y edición), así que el gesto vive
 * acá una sola vez: si el arrastre se siente mal, se arregla en un solo lugar.
 *
 * El arrastre no se puede enganchar a cualquier toque. Adentro del panel hay una lista que
 * scrollea y hay campos de formulario, y ambos usan el mismo dedo. Las reglas están en
 * `startDrag`.
 */

/** Cuánto hay que arrastrar para que el panel se cierre al soltar. */
const CLOSE_DISTANCE_PX = 110

/** Velocidad a partir de la cual cierra aunque no se haya llegado a la distancia. */
const CLOSE_VELOCITY_PX_PER_MS = 0.5

/** Duración de la animación de entrada y salida. Igual a la de las clases de abajo. */
const ANIMATION_MS = 260

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** Nombre del panel para lectores de pantalla; no se ve. */
  label: string
  children: ReactNode
}

export default function BottomSheet({ open, onClose, label, children }: BottomSheetProps) {
  /*
   * `open` es lo que pide el padre; `mounted` es lo que hay en el DOM. Son distintos porque
   * al cerrar el panel tiene que seguir montado mientras dura la animación de salida.
   */
  const [mounted, setMounted] = useState(open)
  const [entered, setEntered] = useState(false)

  /* Desplazamiento del arrastre en curso, en píxeles. 0 = panel en su lugar. */
  const [dragOffset, setDragOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ y: number; time: number } | null>(null)

  /*
   * Los dos estados se ajustan durante el render y no dentro de un efecto. Es el patrón que
   * recomienda React para el estado que se deriva de una prop: hecho en un efecto, el
   * usuario alcanza a ver un cuadro con el panel montado en la posición equivocada.
   */
  if (open && !mounted) {
    setMounted(true)
    setDragOffset(0)
  }
  if (!open && entered) {
    setEntered(false)
  }

  /* Entrada: se anima al cuadro siguiente, ya con el panel montado abajo de todo. */
  useEffect(() => {
    if (!open || entered) return

    /*
     * Dos cuadros de espera y no uno. Con uno solo el navegador puede llegar a pintar el
     * panel ya en su posición final, y entonces no se ve la entrada sino un salto.
     */
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [open, entered])

  /* Salida: el panel sigue en el DOM hasta que termina de bajar. */
  useEffect(() => {
    if (open || !mounted) return
    const timer = setTimeout(() => setMounted(false), ANIMATION_MS)
    return () => clearTimeout(timer)
  }, [open, mounted])

  /* Mientras el panel está abierto, el fondo no scrollea: si no, se mueve lo de atrás. */
  useEffect(() => {
    if (!mounted) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mounted])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const endDrag = useCallback(
    (offset: number, elapsed: number) => {
      dragStart.current = null
      setDragging(false)

      const fast = elapsed > 0 && offset / elapsed > CLOSE_VELOCITY_PX_PER_MS
      if (offset > CLOSE_DISTANCE_PX || (fast && offset > 24)) {
        onClose()
        return
      }
      /* No alcanzó: vuelve a su lugar y la transición hace el resto. */
      setDragOffset(0)
    },
    [onClose],
  )

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    /* Con el mouse solo arrastra el botón principal; con el dedo, cualquier toque. */
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const target = event.target as HTMLElement

    /*
     * Un toque sobre un control es para el control, no para el panel: arrastrar desde un
     * input o un botón haría imposible escribir o tocarlos.
     */
    if (target.closest('input, textarea, select, button, a, [data-no-drag]')) return

    /*
     * Y si el contenido está scrolleado, el dedo tiene que seguir scrolleando: recién con la
     * lista arriba de todo el gesto hacia abajo pasa a ser "cerrar". Es como se comportan
     * los paneles nativos. El tirador (`data-drag-handle`) arrastra siempre.
     */
    const onHandle = target.closest('[data-drag-handle]') !== null
    if (!onHandle && (scrollRef.current?.scrollTop ?? 0) > 0) return

    dragStart.current = { y: event.clientY, time: event.timeStamp }
    setDragging(true)
  }

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start) return

    /* Solo hacia abajo: tirar hacia arriba no estira el panel. */
    const offset = Math.max(0, event.clientY - start.y)

    /*
     * El puntero se captura recién cuando el gesto ya se definió como arrastre. Capturarlo
     * en el primer movimiento se comería los toques cortos sobre el contenido.
     */
    if (offset > 6 && event.currentTarget.hasPointerCapture(event.pointerId) === false) {
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    setDragOffset(offset)
  }

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start) return
    endDrag(Math.max(0, event.clientY - start.y), event.timeStamp - start.time)
  }

  if (!mounted) return null

  const visible = entered && open
  const translate = visible ? dragOffset : window.innerHeight

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Fondo. Tocarlo cierra: es la otra forma de salir que pide el diseño. */}
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 transition-opacity duration-[260ms]"
        style={{ opacity: visible ? 1 : 0 }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        /*
          Sin `touch-action` propio: fijarlo en `pan-y` le sacaba al navegador el paneo
          horizontal, y las tiras de fotos de adentro dejaban de poder arrastrarse con el
          dedo. El arrastre del panel no lo necesita, porque el tirador ya declara
          `touch-none` por su cuenta.
        */
        className="bg-st-bg relative flex max-h-[92svh] w-full flex-col rounded-t-3xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)]"
        style={{
          transform: `translateY(${translate}px)`,
          /* Durante el arrastre no hay transición: el panel tiene que seguir al dedo. */
          transition: dragging
            ? 'none'
            : `transform ${ANIMATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
        }}
      >
        {/* Tirador. Es la zona que arrastra siempre, esté el contenido donde esté. */}
        {/*
          `touch-none` es lo que hace que el gesto sea nuestro y no del navegador: sin eso,
          en el celular el paneo vertical se lleva el toque y cancela el arrastre.
        */}
        <div
          data-drag-handle
          className="flex shrink-0 cursor-grab touch-none justify-center pt-3 pb-1 active:cursor-grabbing"
        >
          <span className="bg-st-muted/60 h-1 w-28 rounded-full" />
        </div>

        <div
          ref={scrollRef}
          className="no-scrollbar overflow-y-auto overscroll-contain px-5 pt-3 pb-8"
        >
          {children}
        </div>
      </div>
    </div>
  )
}
