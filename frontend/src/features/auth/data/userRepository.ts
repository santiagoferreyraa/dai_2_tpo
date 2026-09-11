import { api } from '@/lib/api'

import type { UserProfile } from '../types'

/**
 * La única llamada del frontend a `/api/users`.
 *
 * Está separada de `authRepository` porque no es la misma familia de rutas: aquéllas son las
 * dos de `/api/auth` —entrar y darse de alta—, y ésta pregunta por el usuario ya autenticado.
 * El criterio es el mismo que allá: ninguna pantalla escribe una ruta a mano.
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
