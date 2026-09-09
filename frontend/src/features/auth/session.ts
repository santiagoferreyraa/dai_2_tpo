import { useSyncExternalStore } from 'react'

import { setToken } from '@/lib/api'

import type { AuthResponse, Session } from './types'

/**
 * La sesión del usuario: dónde vive, cómo sobrevive a un F5 y quién se entera cuando cambia.
 *
 * **Por qué es un módulo y no un contexto de React.** El cliente HTTP tiene que poder cerrar
 * la sesión cuando el backend rechaza un token vencido, y eso pasa fuera de todo componente:
 * un contexto no se puede leer desde ahí. Así que el estado vive en el módulo, React lo lee
 * con `useSyncExternalStore` y el cliente HTTP lo cierra llamando a una función. La pantalla
 * se entera igual, por la suscripción.
 *
 * **Un solo lugar arma la cabecera `Authorization`.** Este archivo es el único que llama a
 * `setToken`, igual que `api.ts` es el único que escribe la dirección de la API.
 */

const STORAGE_KEY = 'ecopedia.session'

let session: Session | null = null
const listeners = new Set<() => void>()

/**
 * Convierte la respuesta del login en la sesión que se guarda.
 *
 * El backend manda `expiresInSeconds` —una duración— y acá se resuelve a un instante. Es la
 * diferencia entre poder y no poder contestar "¿este token que estaba en el navegador desde
 * anteayer sigue sirviendo?".
 */
function toSession(auth: AuthResponse): Session {
  return {
    token: auth.token,
    userId: auth.userId,
    email: auth.email,
    role: auth.role,
    expiresAt: Date.now() + auth.expiresInSeconds * 1000,
  }
}

function isExpired(candidate: Session): boolean {
  return candidate.expiresAt <= Date.now()
}

function notify(): void {
  for (const listener of listeners) listener()
}

/**
 * Lee la sesión guardada y la deja lista para usar. Se llama una sola vez, al arrancar.
 *
 * Se hace antes del primer render a propósito: si se hiciera dentro de un efecto, la primera
 * pasada del guard vería "sin sesión" y mandaría al login a alguien que sí la tenía.
 *
 * Un token vencido se descarta acá mismo. No tiene sentido rehidratarlo para que el backend
 * lo rechace en la primera llamada y recién ahí cerrar la sesión.
 */
export function restoreSession(): void {
  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // Modo incógnito o almacenamiento bloqueado: se sigue sin sesión persistida.
    return
  }
  if (stored === null) return

  try {
    const candidate = JSON.parse(stored) as Session
    if (isExpired(candidate)) {
      clearSession()
      return
    }
    session = candidate
    setToken(candidate.token)
  } catch {
    // Lo guardado no es una sesión válida (versión vieja del formato, o basura). Se descarta.
    clearSession()
  }
}

/** Abre la sesión con lo que devolvió el login: la guarda, la persiste y la publica. */
export function openSession(auth: AuthResponse): Session {
  session = toSession(auth)
  setToken(session.token)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Sin persistencia la sesión vive igual, solo que no sobrevive a un F5.
  }
  notify()
  return session
}

/** Cierra la sesión: la borra de memoria, del almacenamiento y del cliente HTTP. */
export function clearSession(): void {
  session = null
  setToken(null)
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
  notify()
}

/** La sesión actual, o `null`. Para código que no es un componente. */
export function getSession(): Session | null {
  return session
}

/**
 * Cierra la sesión solo si el token que tenemos ya venció.
 *
 * La usa el cliente HTTP cuando el backend rechaza una llamada, y la condición no es
 * cosmética: **un 403 no distingue "token vencido" de "rol equivocado"**, porque la cadena de
 * seguridad deja pasar todas las URL y quien rechaza es la anotación sobre el método, que
 * responde igual para un anónimo que para un usuario sin permiso. Si cerráramos la sesión ante
 * cualquier 403, un conductor que toca una pantalla de operador quedaría deslogueado sin
 * motivo. Mirando el vencimiento se separan los dos casos sin preguntarle nada al backend.
 */
export function clearSessionIfExpired(): void {
  if (session !== null && isExpired(session)) clearSession()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): Session | null {
  return session
}

/** La sesión actual, para componentes. Se vuelve a renderizar cuando cambia. */
export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
