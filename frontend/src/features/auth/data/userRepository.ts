import { api } from '@/lib/api'

import type { UserProfile } from '../types'

/**
 * Las llamadas del frontend a `/api/users`: leer el propio perfil y editarlo.
 *
 * Están separadas de `authRepository` porque no son la misma familia de rutas: aquéllas son las
 * dos de `/api/auth` —entrar y darse de alta—, y éstas son sobre el usuario ya autenticado. El
 * criterio es el mismo que allá: ninguna pantalla escribe una ruta a mano.
 *
 * **Ninguna de las dos lleva el id del usuario, y no es un olvido**: el backend lo saca del
 * token, así que la edición solo puede alcanzar a quien la pide. Sin id en la dirección no hay
 * número que probar para caer en el perfil de otro.
 */

/**
 * El perfil del usuario del token: nombre real, rol y estado.
 *
 * No lleva parámetros a propósito. El backend resuelve de quién es el perfil a partir del token
 * —ver `UserController#getMyProfile`—, así que mandarle un id desde acá sería repetir un dato
 * que el servidor ya tiene y que además no le creería.
 */
export function fetchMyProfile(): Promise<UserProfile> {
  return api.get<UserProfile>('/users/profile')
}

/**
 * Cambia el nombre del usuario del token y devuelve el perfil ya guardado.
 *
 * Se devuelve lo que quedó en la base y no lo que se mandó: si algún día el backend recorta o
 * normaliza el nombre, la pantalla muestra el resultado de verdad y no su propia suposición.
 *
 * El nombre es lo ÚNICO editable, y la lista corta es una regla de negocio: el correo identifica
 * la cuenta y viaja en el token, y el rol es una decisión administrativa. Ver
 * `UpdateProfileRequest` en el backend.
 */
export function updateMyProfile(fullName: string): Promise<UserProfile> {
  return api.put<UserProfile>('/users/profile', { fullName })
}
