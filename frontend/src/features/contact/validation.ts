/**
 * Validación del formulario de contacto.
 *
 * Vive aparte del componente y devuelve mensajes, no booleanos: el componente decide dónde
 * mostrarlos y esta parte decide qué está mal. Así se puede leer la regla sin leer el JSX.
 *
 * Los mensajes están en castellano porque los lee el usuario. Ver la regla 8 del README: el
 * código en inglés, lo que se ve en pantalla en castellano.
 */

export interface ContactDraft {
  name: string
  email: string
  message: string
}

/** Un mensaje por campo que esté mal. Un campo sin problema no aparece. */
export type ContactErrors = Partial<Record<keyof ContactDraft, string>>

/**
 * Tope del mensaje.
 *
 * No es una regla de negocio, es una limitación del transporte: el mensaje viaja dentro de una
 * dirección `mailto:` y varios clientes de correo cortan las direcciones muy largas sin avisar.
 * Mil caracteres entran holgados y alcanzan de sobra para una consulta.
 */
export const MESSAGE_MAX_LENGTH = 1000

/**
 * Forma mínima de un correo: algo, una arroba, algo, un punto, algo.
 *
 * Deliberadamente floja. Validar direcciones de correo con una expresión regular estricta
 * rechaza direcciones válidas y raras, y aun así deja pasar las que no existen: lo único que
 * prueba que una dirección anda es mandarle un mensaje. Esto solo ataja el error de tipeo.
 */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateContact(draft: ContactDraft): ContactErrors {
  const errors: ContactErrors = {}

  if (draft.name.trim().length === 0) {
    errors.name = 'Decinos cómo te llamás.'
  }

  if (draft.email.trim().length === 0) {
    errors.email = 'Necesitamos tu correo para poder contestarte.'
  } else if (!EMAIL_SHAPE.test(draft.email.trim())) {
    errors.email = 'Ese correo no parece estar bien escrito.'
  }

  if (draft.message.trim().length === 0) {
    errors.message = 'Contanos qué necesitás.'
  } else if (draft.message.length > MESSAGE_MAX_LENGTH) {
    errors.message = `El mensaje no puede pasar de ${MESSAGE_MAX_LENGTH} caracteres.`
  }

  return errors
}
