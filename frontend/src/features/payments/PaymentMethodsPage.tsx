import { useEffect, useState } from 'react'

import { ApiError } from '@/lib/api'

import CardForm from './components/CardForm'
import PaymentMethodRow from './components/PaymentMethodRow'
import { listCards, registerCard, removeCard } from './data/paymentMethodsRepository'
import { describeCard } from './format'
import type { PaymentMethod, RegisterCardInput } from './types'

/**
 * Los medios de pago del conductor (RF02, ECO-26).
 *
 * **Por qué esta pantalla importa más de lo que parece.** Tener al menos una tarjeta vigente es
 * precondición de toda transacción del sistema: sin eso no se reserva (RF08) ni se inicia una
 * carga (RF10). Es la única pantalla que puede desbloquear al conductor, así que cuando la
 * lista está vacía no se limita a estar vacía — lo dice y ofrece la salida.
 *
 * **El estado se recarga del servidor después de cada cambio.** El alta devuelve la tarjeta
 * creada y se la podría agregar a la lista en memoria; la baja, quitarla. Se prefiere volver a
 * pedir: las reglas de qué se lista y qué no —vigentes sí, dadas de baja no, el orden— viven en
 * el backend, y replicarlas acá crea dos definiciones que se desincronizan sin que nadie lo
 * note. Son dos tarjetas: la llamada de más no se siente.
 */
export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  /* Se recarga cambiando esta marca. Es lo que dispara el efecto después de un alta o una baja. */
  const [reloadToken, setReloadToken] = useState(0)

  /**
   * Pide de nuevo el listado.
   *
   * `loading` se enciende acá y no adentro del efecto a propósito: encenderlo dentro dispara un
   * render extra en cada pasada —React vuelve a renderizar por un estado que el efecto acaba de
   * cambiar— y además deja la pantalla dependiendo de un orden que no se ve al leerla. El estado
   * lo cambia el evento que lo causó, que es el alta, la baja o el primer montaje.
   */
  function reload() {
    setLoading(true)
    setReloadToken((token) => token + 1)
  }

  useEffect(() => {
    const controller = new AbortController()

    listCards(controller.signal)
      .then((loaded) => {
        setCards(loaded)
        setLoadError(null)
      })
      .catch((cause: unknown) => {
        // Una petición cancelada por desmontaje no es un error que mostrar: la pantalla ya no está.
        if (controller.signal.aborted) return
        setLoadError(
          cause instanceof ApiError ? cause.message : 'No se pudieron cargar tus tarjetas',
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [reloadToken])

  async function handleRegister(input: RegisterCardInput) {
    setSending(true)
    setFormError(null)
    try {
      await registerCard(input)
      setAdding(false)
      reload()
    } catch (cause) {
      // El mensaje viene del backend —"La tarjeta está vencida", "Ese número no es válido"— y se
      // muestra tal cual: es más preciso que cualquier texto genérico que pusiéramos acá.
      setFormError(cause instanceof ApiError ? cause.message : 'No se pudo guardar la tarjeta')
    } finally {
      setSending(false)
    }
  }

  async function handleRemove(card: PaymentMethod) {
    /*
     * Se confirma porque la baja no se deshace desde acá, y porque el botón está a un clic de
     * distancia en una lista donde las filas se parecen entre sí. El texto nombra la tarjeta: un
     * "¿Estás seguro?" pelado no ayuda a saber cuál se está por borrar.
     */
    const confirmed = window.confirm(
      `¿Eliminar ${describeCard(card.brand, card.lastFour)}? Vas a tener que cargarla de nuevo para usarla.`,
    )
    if (!confirmed) return

    setRemovingId(card.id)
    setLoadError(null)
    try {
      await removeCard(card.id)
      reload()
    } catch (cause) {
      setLoadError(cause instanceof ApiError ? cause.message : 'No se pudo eliminar la tarjeta')
    } finally {
      setRemovingId(null)
    }
  }

  const hasUsableCard = cards.some((card) => !card.expired)

  return (
    <section className="mx-auto flex h-full w-full max-w-2xl flex-col gap-6 overflow-y-auto p-6">
      <header>
        <h1 className="text-primary text-2xl font-semibold">Medios de pago</h1>
        <p className="text-text-muted mt-1 text-sm">
          Necesitás al menos una tarjeta vigente para reservar un conector o iniciar una carga.
        </p>
      </header>

      {/*
        El aviso de que falta una tarjeta vigente se muestra también cuando la lista NO está
        vacía: un conductor con dos tarjetas vencidas ve filas en pantalla y no tiene por qué
        deducir solo que ninguna le sirve.
      */}
      {!loading && !hasUsableCard && (
        <p
          className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
          role="status"
        >
          No tenés ninguna tarjeta vigente, así que todavía no podés reservar ni cargar.
        </p>
      )}

      {loadError !== null && (
        <p className="text-sm text-red-600" role="alert">
          {loadError}
        </p>
      )}

      {loading ? (
        <p className="text-text-muted text-sm">Cargando tus tarjetas…</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {cards.map((card) => (
            <PaymentMethodRow
              key={card.id}
              card={card}
              onRemove={handleRemove}
              removing={removingId === card.id}
            />
          ))}
        </ul>
      )}

      {adding ? (
        <div className="border-border bg-surface rounded-2xl border p-6">
          <h2 className="mb-4 text-lg font-semibold">Nueva tarjeta</h2>
          <CardForm
            onSubmit={handleRegister}
            onCancel={() => {
              setAdding(false)
              setFormError(null)
            }}
            error={formError}
            sending={sending}
          />
        </div>
      ) : (
        <button
          className="border-border hover:bg-background rounded-lg border border-dashed px-4 py-3 text-sm font-medium"
          type="button"
          onClick={() => setAdding(true)}
        >
          Agregar tarjeta
        </button>
      )}
    </section>
  )
}
