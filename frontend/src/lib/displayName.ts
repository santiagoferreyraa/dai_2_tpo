/**
 * El nombre que se muestra en pantalla.
 *
 * Sale de `Session.fullName`, que es el nombre real: lo devuelve `GET /users/profile` y lo guarda
 * la sesión apenas se abre —ver `hydrateFullName` en `session.ts`—.
 *
 * **El provisorio sigue existiendo, pero ya no es lo normal.** `fullName` es `null` en dos
 * momentos: el rato entre que se entra y contesta el perfil, y el caso en que esa llamada falla.
 * Ahí se usa lo que hay, la parte anterior a la arroba con la primera letra en mayúscula, que es
 * una heurística y se nota (`j.perez@…` da "J.perez"). Se prefiere igual a mostrar el correo
 * entero, que en el ancho de una ficha se corta a la mitad y no dice nada mejor.
 *
 * Vive en `lib` y no en una feature porque lo usan tres —la navegación, el perfil y la portada— y
 * no es de ninguna.
 */

import type { Session } from '@/features/auth/types'

/** El provisorio: la parte anterior a la arroba, capitalizada. */
function fromEmail(email: string): string {
  const localPart = email.split('@')[0] ?? email
  if (localPart.length === 0) return email
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}

export function displayNameOf(session: Session): string {
  const name = session.fullName?.trim() ?? ''
  return name.length > 0 ? name : fromEmail(session.email)
}
