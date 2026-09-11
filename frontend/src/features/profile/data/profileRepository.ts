import type { UserProfile } from '@/features/auth/types'
import { api } from '@/lib/api'

/**
 * Acceso a datos del perfil propio: las dos llamadas del usuario autenticado sobre sí mismo.
 *
 * **Ninguna lleva el id del usuario, y no es un olvido.** El backend lo saca del token, así que
 * la operación solo puede alcanzar a quien la pide: sin id en la dirección no hay número que
 * probar para caer en el perfil de otro. Ver `UserController.updateMyProfile`.
 *
 * El tipo que devuelven es el mismo `UserProfile` que ya usa el registro: es el mismo recurso
 * del backend, así que duplicar el tipo sería abrir la puerta a que los dos se separen.
 */

/** El perfil de quien está logueado, tal como está en la base. */
export function fetchProfile(signal?: AbortSignal): Promise<UserProfile> {
  return api.get<UserProfile>('/users/profile', { signal })
}

/**
 * Cambia el nombre y devuelve el perfil ya guardado.
 *
 * Se devuelve lo que quedó en la base y no lo que se mandó: si algún día el backend recorta o
 * normaliza el nombre, la pantalla muestra el resultado de verdad y no su propia suposición.
 */
export function updateProfileName(fullName: string): Promise<UserProfile> {
  return api.put<UserProfile>('/users/profile', { fullName })
}
