/**
 * Cliente HTTP de la API de Ecopedia.
 *
 * Todas las llamadas del frontend pasan por acá. No es para ahorrar tipeo: es para que
 * haya dos lugares únicos en vez de veinte —la dirección de la API y el token de sesión—,
 * de modo que mudar de ambiente o agregar autenticación sea tocar un solo archivo.
 *
 * Las rutas se escriben relativas y SIN el prefijo `/api`, que lo agrega el cliente:
 *
 *     const terminales = await api.get<Terminal[]>('/terminales', { parametros: { ciudad } })
 *
 * Ver el README del repo, "Direcciones y configuración".
 */

/** Prefijo que el proxy de Vite redirige al backend. Ver `vite.config.ts`. */
const RAIZ = '/api'

/**
 * Error de una llamada a la API.
 *
 * `estado` es el código HTTP, o `0` cuando la petición no llegó a salir (backend caído,
 * sin conexión, petición cancelada).
 */
export class ErrorDeApi extends Error {
  readonly estado: number
  readonly detalle: unknown

  constructor(mensaje: string, estado: number, detalle?: unknown) {
    super(mensaje)
    this.name = 'ErrorDeApi'
    this.estado = estado
    this.detalle = detalle
  }
}

let tokenDeSesion: string | null = null

/**
 * Guarda el token que viaja en cada llamada; con `null` cierra la sesión.
 *
 * Lo va a llamar el login cuando exista. Es el único lugar del frontend que arma la
 * cabecera `Authorization`: si se agrega a mano en cada pantalla, siempre falta en alguna.
 */
export function definirToken(token: string | null): void {
  tokenDeSesion = token
}

export type ValorDeParametro = string | number | boolean

export interface OpcionesDePeticion {
  /** Parámetros de query. Las claves con valor `undefined` no se envían. */
  parametros?: Record<string, ValorDeParametro | undefined>
  /** Para cancelar la petición si la pantalla se desmonta antes de que responda. */
  senal?: AbortSignal
}

function armarUrl(ruta: string, parametros: OpcionesDePeticion['parametros']): string {
  const url = `${RAIZ}${ruta}`
  if (!parametros) return url

  const query = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined) query.append(clave, String(valor))
  }

  const cadena = query.toString()
  return cadena ? `${url}?${cadena}` : url
}

/**
 * Spring Boot 3 responde los errores como ProblemDetail (RFC 7807): de ahí sale el texto
 * que se le muestra al usuario. Si la respuesta no trae JSON, queda el código de estado.
 */
async function leerError(respuesta: Response): Promise<ErrorDeApi> {
  let cuerpo: unknown = null
  try {
    cuerpo = await respuesta.json()
  } catch {
    // La respuesta no traía JSON válido; nos quedamos con el estado.
  }

  const problema = cuerpo as { detail?: string; title?: string; message?: string } | null
  const mensaje =
    problema?.detail ?? problema?.title ?? problema?.message ?? `Error ${respuesta.status}`

  return new ErrorDeApi(mensaje, respuesta.status, cuerpo)
}

async function peticion<T>(
  metodo: string,
  ruta: string,
  cuerpo?: unknown,
  opciones?: OpcionesDePeticion,
): Promise<T> {
  const cabeceras: Record<string, string> = { Accept: 'application/json' }
  if (cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (tokenDeSesion !== null) cabeceras['Authorization'] = `Bearer ${tokenDeSesion}`

  let respuesta: Response
  try {
    respuesta = await fetch(armarUrl(ruta, opciones?.parametros), {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: opciones?.senal,
    })
  } catch (error) {
    throw new ErrorDeApi('No se pudo conectar con el servidor', 0, error)
  }

  if (!respuesta.ok) throw await leerError(respuesta)

  // Un 204 (o un DELETE, o un POST sin cuerpo de respuesta) no trae JSON que parsear.
  if (respuesta.status === 204 || respuesta.status === 205) return undefined as T

  const texto = await respuesta.text()
  return (texto ? JSON.parse(texto) : undefined) as T
}

export const api = {
  get: <T>(ruta: string, opciones?: OpcionesDePeticion) =>
    peticion<T>('GET', ruta, undefined, opciones),

  post: <T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesDePeticion) =>
    peticion<T>('POST', ruta, cuerpo, opciones),

  put: <T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesDePeticion) =>
    peticion<T>('PUT', ruta, cuerpo, opciones),

  patch: <T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesDePeticion) =>
    peticion<T>('PATCH', ruta, cuerpo, opciones),

  delete: <T = void>(ruta: string, opciones?: OpcionesDePeticion) =>
    peticion<T>('DELETE', ruta, undefined, opciones),
}
