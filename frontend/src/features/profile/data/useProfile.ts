import { useCallback, useEffect, useState } from 'react'

import { useSession } from '@/features/auth/session'
import type { UserProfile } from '@/features/auth/types'

import { fetchProfile, updateProfileName } from './profileRepository'

/**
 * El perfil del usuario logueado: se carga una vez y se puede editar.
 *
 * **Por qué no alcanza con la sesión.** La sesión guarda lo que viaja en el token —correo, rol
 * e id— y eso es todo lo que devuelve el login. El NOMBRE no está ahí, y hasta ahora la
 * pantalla lo inventaba a partir del correo con `displayNameFrom`: `j.perez@…` daba "J.perez".
 * El nombre real está en la base desde el registro, a una llamada de distancia; esta es esa
 * llamada.
 *
 * **Lo cargado se guarda junto con el correo de quien lo pidió**, y de ahí sale todo lo demás:
 * si el resultado guardado no es del dueño de la sesión actual, no se muestra. Eso resuelve de
 * una sola forma dos casos que si no habría que limpiar a mano —cerrar sesión y entrar con otra
 * cuenta— y evita el destello en el que la pantalla saluda con el nombre del usuario anterior.
 *
 * **Guardar reemplaza lo cargado con lo que devolvió el backend**, no con lo que se mandó: lo
 * que se muestra es siempre lo último que quedó en la base.
 */

/** Lo cargado, con la cuenta a la que pertenece. Ver el comentario de arriba. */
interface Loaded {
  email: string
  profile: UserProfile | null
  error: string | null
}

export interface ProfileState {
  profile: UserProfile | null
  loading: boolean
  /** Falla de la carga inicial. La del guardado se devuelve aparte, ver `save`. */
  error: string | null
  /**
   * Guarda el nombre. Resuelve con `null` si salió bien, o con el mensaje del error.
   *
   * Devuelve el error en vez de tirarlo porque quien la llama es un formulario, y un
   * formulario necesita el mensaje al lado del campo, no una excepción que lo desmonte.
   */
  save: (fullName: string) => Promise<string | null>
}

export function useProfile(): ProfileState {
  const session = useSession()
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (session === null) return

    /*
      Si la pantalla se desmonta antes de que el backend conteste, la petición se cancela. Ese
      rechazo NO es un error para mostrar: nadie está esperando la respuesta. Mismo criterio
      que usa la portada.
    */
    const controller = new AbortController()
    const email = session.email

    fetchProfile(controller.signal)
      .then((profile) => {
        setLoaded({ email, profile, error: null })
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setLoaded({
          email,
          profile: null,
          error: cause instanceof Error ? cause.message : 'No se pudo cargar el perfil',
        })
      })

    return () => controller.abort()
  }, [session])

  const save = useCallback(async (fullName: string): Promise<string | null> => {
    try {
      const profile = await updateProfileName(fullName)
      setLoaded({ email: profile.email, profile, error: null })
      return null
    } catch (cause: unknown) {
      return cause instanceof Error ? cause.message : 'No se pudo guardar el nombre'
    }
  }, [])

  /* Lo cargado solo vale si es de la cuenta que está mirando. */
  const current = loaded !== null && loaded.email === session?.email ? loaded : null

  return {
    profile: current?.profile ?? null,
    /* Hay sesión y todavía no hay resultado de ESTA cuenta: está cargando. */
    loading: session !== null && current === null,
    error: current?.error ?? null,
    save,
  }
}
