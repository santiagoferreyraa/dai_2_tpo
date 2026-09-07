/**
 * Tipos de la feature Auth.
 *
 * Espejan los records de la capa de negocio del backend (com.ecopedia.core.user.domain).
 * Los nombres de campo son los que viajan en el JSON, así que van tal cual salen de Jackson.
 */

/**
 * Los roles con el nombre que viaja en el token, que es el del enum Java.
 *
 * Ojo con la asimetría: ARQUITECTURA_ECOPEDIA.md nombra estos roles `DRIVER`, `OPERATOR` y
 * `ADMIN`, y el código dice `CONDUCTOR`, `CPO` y `ADMIN`. La divergencia es una decisión
 * tomada, no un descuido — pero acá manda el backend, porque esto es el contrato del JSON.
 */
export type Role = 'CONDUCTOR' | 'CPO' | 'ADMIN'

/** Lo que pide el formulario de login. Equivale a Credentials. */
export interface Credentials {
  email: string
  password: string
}

/**
 * Lo que pide el formulario de registro. Equivale a RegisterRequest.
 *
 * **No lleva rol, y es a propósito.** El alta es pública, así que aceptar el rol por
 * parámetro dejaría que cualquiera se emitiera una cuenta de administrador. Todo el que se
 * registra nace `CONDUCTOR`.
 */
export interface RegistrationInput {
  email: string
  password: string
  fullName: string
}

/** La respuesta del login. Equivale a AuthResponse. */
export interface AuthResponse {
  token: string
  userId: number
  email: string
  role: Role
  expiresInSeconds: number
}

/** El perfil que devuelve el registro. Equivale a UserProfileResponse. */
export interface UserProfile {
  id: number
  email: string
  fullName: string
  role: Role
  active: boolean
  createdAt: string
}

/**
 * La sesión tal como la guarda el front.
 *
 * Es `AuthResponse` con el vencimiento resuelto a un instante absoluto en vez de una
 * duración: guardar "24 horas" no sirve para saber si un token rehidratado tres días después
 * sigue valiendo, y guardar el instante sí.
 */
export interface Session {
  token: string
  userId: number
  email: string
  role: Role
  expiresAt: number
}
