import { useSyncExternalStore } from 'react'

/**
 * Quién está usando la aplicación, para la navegación.
 *
 * **Esto es una costura provisoria, y conviene entender por qué existe.** La sesión de verdad
 * —con su login, su token y su vencimiento— vive en `features/auth/session.ts`, que hoy está
 * en la rama de ECO-36 y todavía no entró a `main`. La navbar la necesita igual, así que en
 * vez de importar un módulo que acá no existe, lee **la misma clave de almacenamiento** con
 * **la misma forma de dato**.
 *
 * La consecuencia buena es que esto no es una maqueta: apenas auth mergee, la aplicación
 * queda funcionando sin tocar un solo componente, porque la clave y los campos ya coinciden.
 *
 * **Cuando auth entre a `main`, este archivo se borra** y la única línea que cambia es el
 * import de `Navbar.tsx`:
 *
 * ```ts
 * import { useSession } from '@/features/auth/session'
 * ```
 *
 * Lo que se pierde mientras tanto: auth notifica los cambios por suscripción propia, y acá
 * solo escuchamos el evento `storage`, que el navegador dispara **entre pestañas y no en la
 * que escribió**. Alcanza de sobra para lo que hay hoy en `main`, donde nada abre ni cierra
 * sesión; si algo lo hiciera, la navbar se enteraría recién al recargar. Es exactamente la
 * clase de limitación que desaparece con el import de arriba.
 */

/** La misma clave que escribe `features/auth/session.ts`. Si cambia allá, cambia acá. */
const STORAGE_KEY = 'ecopedia.session'

/** Los roles tal como viajan en el token. Espeja `Role` de `features/auth/types.ts`. */
export type NavRole = 'CONDUCTOR' | 'CPO' | 'ADMIN'

/**
 * Lo que la navegación necesita saber de la sesión, que es bastante menos que la sesión
 * entera: un subconjunto de `Session`, no un tipo paralelo. El token acá no pinta nada, y no
 * tenerlo a mano es lo correcto —la navbar no llama a la API—.
 */
export interface NavSession {
  email: string
  role: NavRole
  expiresAt: number
}

/**
 * `useSyncExternalStore` exige que dos lecturas seguidas sin cambios devuelvan el **mismo**
 * objeto, o React vuelve a renderizar para siempre. Parsear el JSON en cada lectura devuelve
 * uno nuevo cada vez, así que se cachea contra el texto crudo: mientras el string guardado no
 * cambie, se entrega la misma instancia.
 */
let cachedRaw: string | null = null
let cachedSession: NavSession | null = null

function readSession(): NavSession | null {
  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    /* Modo incógnito o almacenamiento bloqueado: se navega como anónimo. */
    return null
  }

  if (raw === cachedRaw) return cachedSession
  cachedRaw = raw

  if (raw === null) {
    cachedSession = null
    return null
  }

  try {
    const candidate = JSON.parse(raw) as NavSession
    /* Un token vencido no es una sesión: la navbar tiene que mostrar el estado anónimo. */
    cachedSession = candidate.expiresAt > Date.now() ? candidate : null
  } catch {
    /* Basura o un formato viejo. Se ignora en vez de romper la navegación entera. */
    cachedSession = null
  }
  return cachedSession
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('storage', onChange)
  return () => window.removeEventListener('storage', onChange)
}

/** Sin ventana (renderizado en el servidor) se asume anónimo. */
function getServerSnapshot(): NavSession | null {
  return null
}

export function useNavSession(): NavSession | null {
  return useSyncExternalStore(subscribe, readSession, getServerSnapshot)
}

/**
 * El nombre que se muestra en el pill, a partir del email.
 *
 * **Es provisorio y se nota:** `Session` guarda `email`, `userId` y `role`, pero **no guarda
 * `fullName`** —el backend lo devuelve en `UserProfileResponse`, que es otra llamada—. Hasta
 * que el nombre viaje en la sesión, se usa lo que hay: la parte anterior a la arroba, con la
 * primera letra en mayúscula.
 *
 * Es una heurística, no un dato: `j.perez@…` da "J.perez". Se prefiere igual a mostrar el
 * email entero, que en el ancho del pill se corta a la mitad y no dice nada mejor.
 */
export function displayNameFrom(email: string): string {
  const localPart = email.split('@')[0] ?? email
  if (localPart.length === 0) return email
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}
