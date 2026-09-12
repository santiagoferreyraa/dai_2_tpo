import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  /** El detalle de qué se está por hacer. Nombra el objeto concreto, no la acción en general. */
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  /** Deshabilita los dos botones mientras la operación está en curso. */
  busy?: boolean
}

/**
 * El cartel de confirmación de la pantalla de medios de pago.
 *
 * **Reemplaza a `window.confirm`**, que es lo que había antes. El nativo funciona, pero se
 * dibuja con el estilo del navegador —distinto en cada uno—, aparece pegado al borde de arriba
 * en el escritorio y en el celular se ve como un aviso del sistema y no de la aplicación. Sobre
 * todo: bloquea el hilo, así que no hay forma de mostrar "Eliminando…" mientras la llamada
 * viaja.
 *
 * **El botón de confirmar es verde y no rojo**, que es lo que suele usarse para una acción
 * destructiva. Es una decisión tomada: en Ecopedia el verde es el color de la acción principal
 * en todas las pantallas, y la que el usuario vino a hacer acá es eliminar. El rojo ya está
 * puesto donde avisa —la cruz sobre la tarjeta—, y repetirlo en el botón no agrega información.
 *
 * **El foco se lleva a Cancelar al abrir.** Es la salida segura: si alguien llega con el dedo o
 * con Enter apoyado, lo que ocurre es que no pasa nada.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  busy = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) cancelRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  /* Con el cartel abierto el fondo no scrollea: si no, se mueve lo de atrás mientras se decide. */
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  if (!open) return null

  return (
    /*
      z-index por encima del panel que sube desde abajo (z-50): en el celular el alta de una
      tarjeta y este cartel pueden llegar a convivir, y el que pregunta tiene que quedar arriba.
    */
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Tocar fuera cancela. Es la misma salida segura que el botón, con el dedo donde caiga. */}
      <button
        type="button"
        aria-label="Cancelar"
        onClick={onCancel}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="border-border bg-background relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
      >
        <h2 id="confirm-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p id="confirm-message" className="text-text-muted mt-2 text-sm">
          {message}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="border-border hover:bg-surface flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="bg-primary hover:bg-primary-strong flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? 'Eliminando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
