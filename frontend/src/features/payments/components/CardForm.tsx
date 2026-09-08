import { type FormEvent, useState } from 'react'

import FormField from '@/components/FormField'

import { BRAND_LABEL, formattedLengthFor, groupCardNumber } from '../format'
import type { RegisterCardInput } from '../types'
import {
  brandOf,
  digitsOf,
  expiryMonthOf,
  expiryYearOf,
  maxDigitsFor,
  validateCardNumber,
  validateExpiry,
  validateHolderName,
} from '../validation'

import CardPreview from './CardPreview'

interface CardFormProps {
  onSubmit: (input: RegisterCardInput) => Promise<void>
  onCancel: () => void
  /** El error que devolvió el backend, si la pasarela rechazó la tarjeta. */
  error: string | null
  sending: boolean
}

/**
 * El alta de una tarjeta (RF02).
 *
 * **El número no se guarda en ningún estado que sobreviva al formulario.** Vive en el `useState`
 * de este componente mientras se escribe, viaja en la llamada de alta y se va con el desmontaje.
 * No pasa por `localStorage`, ni por la sesión, ni por un contexto: el dato más sensible de la
 * aplicación existe en un solo lugar y por el tiempo más corto posible.
 *
 * **No se pide el CVV**, y no es un olvido. El CVV sirve para autorizar una transacción, no para
 * tokenizar, y guardarlo está prohibido por PCI-DSS. Como acá no se cobra nada —el alta solo
 * cambia el número por un token— pedirlo sería juntar un dato que no se puede usar ni guardar.
 *
 * **La marca se muestra pero no se elige.** Aparece sola al escribir el número y es la
 * confirmación visible de que el sistema lo está entendiendo bien. Además es la que define
 * cuántos dígitos entran: en cuanto se sabe que es una Mastercard, el campo corta en dieciséis
 * en vez de dejar llegar al máximo teórico de diecinueve.
 */
export default function CardForm({ onSubmit, onCancel, error, sending }: CardFormProps) {
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [holderName, setHolderName] = useState('')
  const [label, setLabel] = useState('')
  const [attempted, setAttempted] = useState(false)

  const numberDigits = digitsOf(number)
  const brand = brandOf(numberDigits)

  const fieldErrors = {
    number: validateCardNumber(number),
    expiry: validateExpiry(expiry),
    holderName: validateHolderName(holderName),
  }
  const hasFieldErrors = Object.values(fieldErrors).some((message) => message !== undefined)

  /*
   * Los errores aparecen recién al intentar enviar, igual que en el registro: señalar en rojo un
   * número de tarjeta a medio escribir es marcar como inválido algo que todavía se está tipeando.
   */
  function errorOf(field: keyof typeof fieldErrors): string | undefined {
    return attempted ? fieldErrors[field] : undefined
  }

  /**
   * Reformatea en cada tecla para que lo que se ve coincida con la tarjeta física.
   *
   * **El corte es por marca, no en el máximo teórico de 19 dígitos.** En cuanto los primeros
   * dígitos dicen que es una Mastercard, el campo deja de aceptar después del dieciséis. Con un
   * tope único de 19 se puede seguir escribiendo tres dígitos de más y el campo los toma: el
   * número queda imposible, y lo que se ve en pantalla ya no es lo que hay en la mano.
   */
  function handleNumberChange(value: string) {
    const typed = digitsOf(value)
    setNumber(groupCardNumber(typed.slice(0, maxDigitsFor(brandOf(typed)))))
  }

  /**
   * Mete la barra sola y no deja escribirla a mano.
   *
   * Con el campo libre entran "09/26", "0926" y "09 / 26", y las tres hay que interpretarlas.
   * Normalizando en cada tecla el valor siempre tiene la misma forma y la validación no tiene
   * que adivinar nada.
   */
  function handleExpiryChange(value: string) {
    const digits = digitsOf(value).slice(0, 4)
    setExpiry(digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setAttempted(true)
    if (hasFieldErrors) return

    const expiryDigits = digitsOf(expiry)

    await onSubmit({
      number: numberDigits,
      expiryMonth: expiryMonthOf(expiryDigits),
      expiryYear: expiryYearOf(expiryDigits),
      holderName: holderName.trim(),
      label: label.trim() === '' ? undefined : label.trim(),
    })
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      {/*
        La tarjeta va arriba de los campos y no al costado: en celular no hay costado, y
        partir el componente en dos disposiciones para ganar una columna en escritorio es
        mantener dos veces la misma pantalla.
      */}
      <CardPreview brand={brand} digits={numberDigits} holderName={holderName} expiry={expiry} />

      <FormField
        id="card-number"
        label="Número de tarjeta"
        type="text"
        inputMode="numeric"
        /*
          El tope del navegador acompaña al corte por marca. Sin esto se puede seguir tipeando
          aunque handleNumberChange descarte lo que sobra, y se ve un cursor que avanza sin que
          aparezca nada.
        */
        maxLength={formattedLengthFor(brand, maxDigitsFor(brand))}
        placeholder="4111 1111 1111 1111"
        autoComplete="cc-number"
        value={number}
        onChange={handleNumberChange}
        hint={brand !== undefined ? BRAND_LABEL[brand] : 'Visa, Mastercard o American Express.'}
        error={errorOf('number')}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="card-expiry"
          label="Vencimiento"
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="09/29"
          autoComplete="cc-exp"
          value={expiry}
          onChange={handleExpiryChange}
          error={errorOf('expiry')}
          required
        />

        <FormField
          id="card-label"
          label="Etiqueta"
          type="text"
          maxLength={60}
          placeholder="La del laburo"
          value={label}
          onChange={setLabel}
          // Sin `required` y dicho en la pista: con dos tarjetas de la misma marca terminadas en
          // dígitos parecidos, los últimos cuatro no alcanzan para distinguirlas.
          hint="Opcional."
        />
      </div>

      <FormField
        id="card-holder"
        label="Titular"
        type="text"
        maxLength={120}
        placeholder="Como figura en la tarjeta"
        autoComplete="cc-name"
        value={holderName}
        onChange={setHolderName}
        error={errorOf('holderName')}
        required
      />

      {error !== null && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          className="bg-primary flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          type="submit"
          disabled={sending}
        >
          {sending ? 'Guardando…' : 'Guardar tarjeta'}
        </button>

        <button
          className="border-border hover:bg-background rounded-lg border px-4 py-2.5 text-sm font-medium"
          type="button"
          onClick={onCancel}
          disabled={sending}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
