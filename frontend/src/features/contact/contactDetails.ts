/**
 * Los datos de contacto, en un solo lugar.
 *
 * Están acá y no dentro de la pantalla porque los usan dos piezas: la columna de la izquierda los
 * muestra y el formulario le arma el `mailto:` a la misma dirección. Repetidos, se cambia uno y
 * el otro sigue mandando correos a una casilla vieja.
 */

export const CONTACT_EMAIL = 'soporte@ecopedia.com.ar'
export const CONTACT_PHONE = '+54 11 5555-0100'

export interface ContactChannel {
  label: string
  value: string
  href: string
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  { label: 'Correo', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  /* El `href` va sin espacios ni guiones: es lo que el teléfono marca, no lo que se lee. */
  { label: 'Teléfono', value: CONTACT_PHONE, href: 'tel:+541155550100' },
]
