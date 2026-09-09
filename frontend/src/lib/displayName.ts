/**
 * El nombre que se muestra en pantalla, a partir del correo.
 *
 * **Es provisorio y se nota:** `Session` guarda `email`, `userId` y `role`, pero **no guarda
 * `fullName`** —el backend lo devuelve en `UserProfileResponse`, que es otra llamada—. Hasta que
 * el nombre viaje en la sesión, se usa lo que hay: la parte anterior a la arroba, con la primera
 * letra en mayúscula.
 *
 * Es una heurística, no un dato: `j.perez@…` da "J.perez". Se prefiere igual a mostrar el correo
 * entero, que en el ancho de una ficha se corta a la mitad y no dice nada mejor.
 *
 * Vive en `lib` y no en una feature porque lo usan tres —la navegación, el perfil y la portada— y
 * no es de ninguna: es una función sobre una cadena.
 */
export function displayNameFrom(email: string): string {
  const localPart = email.split('@')[0] ?? email
  if (localPart.length === 0) return email
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}
