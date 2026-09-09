import { api } from '@/lib/api'

import type { AuthResponse, Credentials, RegistrationInput, UserProfile } from '../types'

/**
 * Capa de datos de la feature Auth: las dos únicas llamadas a `/api/auth` del frontend.
 *
 * Existe por el mismo motivo que `stationsRepository`, y esa apuesta ya cobró una vez: cuando
 * las rutas REST pasaron a inglés, renombrarlas tocó un solo archivo del front y ni un
 * componente. Ninguna pantalla escribe una ruta a mano.
 */

/** Autentica y devuelve el token con el rol. No guarda nada: de eso se ocupa la sesión. */
export function login(credentials: Credentials): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', credentials)
}

/**
 * Da de alta un usuario y devuelve su perfil.
 *
 * **No devuelve token y no deja la sesión abierta**, porque el backend responde 201 con el
 * perfil. Quien llame tiene que mandar al usuario a la pantalla de login.
 */
export function register(input: RegistrationInput): Promise<UserProfile> {
  return api.post<UserProfile>('/auth/register', input)
}
