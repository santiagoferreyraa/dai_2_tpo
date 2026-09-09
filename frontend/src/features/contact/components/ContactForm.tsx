import { useState, type FormEvent } from 'react'

import { CONTACT_EMAIL } from '../contactDetails'
import {
  MESSAGE_MAX_LENGTH,
  validateContact,
  type ContactDraft,
  type ContactErrors,
} from '../validation'
import ContactField from './ContactField'

/**
 * El formulario de contacto.
 *
 * **No hay backend que reciba esto, y el formulario no finge que sí.** Al enviar arma un enlace
 * `mailto:` con todo cargado y abre el cliente de correo del usuario, que es quien lo manda de
 * verdad. Es una vuelta más que un botón que dice "enviado", pero es la diferencia entre un
 * mensaje que llega y uno que no: mientras `NotificationService` no exista, cualquier otra cosa
 * sería tragarse las consultas y avisar que salió todo bien.
 *
 * Cuando haya un endpoint, lo único que cambia es el cuerpo de `handleSubmit`. La validación, los
 * campos y los estados quedan como están.
 *
 * **No lleva adjuntos**, aunque el diseño de referencia los tenga: un `mailto:` no puede adjuntar
 * archivos. Un clip que no adjunta nada es peor que no tener clip.
 */

const EMPTY: ContactDraft = { name: '', email: '', message: '' }

export default function ContactForm() {
  const [draft, setDraft] = useState<ContactDraft>(EMPTY)
  const [errors, setErrors] = useState<ContactErrors>({})

  /*
   * Si ya se abrió el cliente de correo con este mensaje.
   *
   * No dice "enviado" porque no lo sabemos: lo que sabemos es que le pasamos el mensaje al
   * programa de correo. Prometer más que eso sería mentir sobre algo que ocurre fuera de la
   * aplicación.
   */
  const [handedOff, setHandedOff] = useState(false)

  const update = (field: keyof ContactDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))
    /*
      El error del campo se borra al escribir, y no se revalida en cada tecla: marcar en rojo un
      correo a medio escribir es corregir a alguien que todavía está hablando. La validación
      completa vuelve al enviar.
    */
    setErrors((current) => ({ ...current, [field]: undefined }))
    setHandedOff(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const found = validateContact(draft)
    setErrors(found)
    if (Object.values(found).some((message) => message !== undefined)) return

    const subject = `Consulta de ${draft.name.trim()}`
    const body = `${draft.message.trim()}\n\n—\n${draft.name.trim()}\n${draft.email.trim()}`

    /*
      `encodeURIComponent` en las dos partes y no solo en una: el asunto lleva el nombre que
      escribió el usuario, y basta un `&` ahí adentro para que el cliente de correo lea el resto
      como otro parámetro y pierda el cuerpo del mensaje.
    */
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setHandedOff(true)
  }

  const remaining = MESSAGE_MAX_LENGTH - draft.message.length

  return (
    /*
      `noValidate` apaga los carteles del navegador. No es por estética: vienen en el idioma del
      navegador y no en el de la aplicación, y aparecen de a uno, así que alguien con tres campos
      vacíos se entera de uno por vez.
    */
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <ContactField label="Tu nombre" error={errors.name}>
        {(props) => (
          <input
            {...props}
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Cómo te llamás"
            value={draft.name}
            onChange={(event) => update('name', event.target.value)}
          />
        )}
      </ContactField>

      <ContactField label="Tu correo" error={errors.email}>
        {(props) => (
          <input
            {...props}
            type="email"
            name="email"
            autoComplete="email"
            placeholder="para poder contestarte"
            value={draft.email}
            onChange={(event) => update('email', event.target.value)}
          />
        )}
      </ContactField>

      <ContactField
        label="Tu mensaje"
        error={errors.message}
        /* El resto solo se muestra cuando empieza a importar, no desde el primer momento. */
        hint={remaining <= 200 ? `Te quedan ${remaining} caracteres.` : undefined}
      >
        {(props) => (
          <textarea
            {...props}
            name="message"
            rows={4}
            placeholder="Contanos qué necesitás"
            value={draft.message}
            onChange={(event) => update('message', event.target.value)}
            className={`${props.className} resize-none`}
          />
        )}
      </ContactField>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          className="bg-primary text-background hover:bg-primary-strong self-start rounded-xl px-6 py-3 text-sm font-semibold transition-colors"
        >
          Enviar mensaje
        </button>

        {/*
          Se avisa ANTES de tocar el botón y no después. Que se abra el programa de correo es
          inesperado si nadie lo anticipó, y quien no tenga uno configurado necesita saber que
          existe la dirección de al lado para escribir por su cuenta.
        */}
        <p className="text-text-muted text-xs" role={handedOff ? 'status' : undefined}>
          {handedOff
            ? 'Listo: abrimos tu aplicación de correo con el mensaje escrito. Falta que lo envíes desde ahí.'
            : 'Se abre tu aplicación de correo con el mensaje ya escrito.'}
        </p>
      </div>
    </form>
  )
}
