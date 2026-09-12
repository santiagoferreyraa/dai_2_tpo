import { useSyncExternalStore } from 'react'

/**
 * El avatar elegido: el catálogo, dónde se guarda la elección y quién se entera cuando cambia.
 *
 * **Vive en el navegador y no en el backend, y eso es una limitación conocida.** `UserProfile`
 * tiene id, correo, nombre, rol, estado y fecha de alta: no hay columna de avatar, ni endpoint
 * que la acepte —`updateMyProfile` manda un solo campo, y es el nombre—. Guardarlo acá es lo que
 * permite que la elección exista hoy sin inventarle al backend un contrato que no tiene. La
 * consecuencia hay que tenerla presente: **la misma cuenta abierta en otra máquina no ve el
 * avatar elegido en ésta**. El día que el perfil tenga el campo, lo único que cambia es de dónde
 * se lee; el catálogo y las pantallas quedan como están.
 *
 * **Se guarda por usuario y no como un valor suelto.** En una máquina compartida —o simplemente
 * en la de alguien que prueba dos cuentas— una sola clave haría que el segundo usuario heredara
 * la cara del primero. Con el id adentro de la clave, cada cuenta se acuerda de la suya, y salir
 * y volver a entrar devuelve la misma.
 *
 * **Es el mismo patrón que `auth/session.ts`**: el estado vive en el módulo, React lo lee con
 * `useSyncExternalStore` y quien escribe avisa. La ficha de la franja de arriba y la cabecera del
 * perfil están en ramas distintas del árbol, así que un estado local en la pantalla de edición no
 * las alcanzaría: al guardar, el redondel de arriba seguiría con el anterior hasta recargar.
 */

/** Cuántos hay en `public/avatars`. Los archivos se llaman `avatar-01.png` … `avatar-23.png`. */
const AVATAR_COUNT = 23

/**
 * Los identificadores del catálogo, en orden.
 *
 * Se derivan del conteo en vez de escribirse a mano: la lista tiene veintitrés entradas y
 * tipearlas una por una es la forma segura de que alguna quede repetida o salteada. Agregar
 * caras es copiar los archivos y subir el número.
 */
export const AVATAR_IDS: readonly string[] = Array.from(
  { length: AVATAR_COUNT },
  (_, index) => `avatar-${String(index + 1).padStart(2, '0')}`,
)

/**
 * La dirección del dibujo de un avatar.
 *
 * Es una ruta a `public` y no un `import`, por lo mismo que `VEHICLE_IMAGE`: son veintitrés
 * imágenes de las que se muestra una: importarlas todas las mete al empaquetado para que el
 * navegador descargue veintidós que nadie va a ver. Desde `public` se pide solo la elegida.
 */
export function avatarSrc(avatarId: string): string {
  return `/avatars/${avatarId}.png`
}

/** Si un identificador guardado sigue existiendo en el catálogo. Ver `read`. */
function isKnown(avatarId: string): boolean {
  return AVATAR_IDS.includes(avatarId)
}

function storageKey(userId: number): string {
  return `ecopedia.avatar.${String(userId)}`
}

const listeners = new Set<() => void>()

/**
 * La copia en memoria de lo guardado, por usuario.
 *
 * **No se lee de `localStorage` en cada render, y no es por velocidad.** `useSyncExternalStore`
 * compara lo que devuelve `getSnapshot` entre renders y exige que sea estable mientras no haya
 * cambiado nada; leyendo del almacenamiento cada vez, un valor ausente devolvería `null` nuevo
 * cada pasada —que es estable— pero cualquier cambio a devolver objetos rompería el ciclo. El
 * mapa mantiene la respuesta idéntica hasta que alguien escribe, que es cuando se avisa.
 *
 * `undefined` en el mapa significa "todavía no se miró"; `null`, "se miró y no hay elección".
 */
const chosen = new Map<number, string | null>()

function read(userId: number): string | null {
  const cached = chosen.get(userId)
  if (cached !== undefined) return cached

  let stored: string | null = null
  try {
    stored = window.localStorage.getItem(storageKey(userId))
  } catch {
    // Modo incógnito o almacenamiento bloqueado: se sigue sin avatar elegido.
  }

  /*
    Lo guardado se valida contra el catálogo antes de aceptarlo. Un identificador de una versión
    con más caras —o escrito a mano en el almacenamiento— daría una imagen rota en el redondel
    del perfil, que es el peor lugar posible para un ícono de archivo faltante.
  */
  const valid = stored !== null && isKnown(stored) ? stored : null
  chosen.set(userId, valid)
  return valid
}

/** Guarda la elección y avisa a las pantallas que muestran el redondel. */
export function chooseAvatar(userId: number, avatarId: string): void {
  if (!isKnown(avatarId)) return

  chosen.set(userId, avatarId)
  try {
    window.localStorage.setItem(storageKey(userId), avatarId)
  } catch {
    // Sin persistencia la elección vale igual, solo que no sobrevive a un F5.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * El avatar elegido por este usuario, o `null` si todavía no eligió ninguno.
 *
 * **`null` no es un error ni un estado de espera: es "no eligió".** Quien nunca pasó por editar
 * el perfil tiene que ver lo que se veía antes de que existiera el catálogo —el redondel vacío,
 * el volante en la ficha de arriba— y no una cara sorteada. Un avatar asignado sin pedirlo se lee
 * como un dato de la cuenta, y nadie entendería que puede cambiarlo.
 *
 * Acepta `null` como usuario para que las pantallas puedan llamarlo sin sesión: los hooks no se
 * pueden poner detrás de un `if`, y la alternativa sería partir cada componente en dos.
 */
export function useAvatarId(userId: number | null): string | null {
  return useSyncExternalStore(
    subscribe,
    () => (userId === null ? null : read(userId)),
    () => null,
  )
}
