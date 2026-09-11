import { api } from '@/lib/api'

import type { PaymentMethod, RegisterCardInput } from '../types'

/**
 * Capa de datos de la feature Payments: las tres llamadas a `/api/payment-methods` (RF02).
 *
 * Existe por el mismo motivo que `authRepository` y `stationsRepository`: ninguna pantalla
 * escribe una ruta a mano. Y acá hay una razón extra, propia de este componente.
 *
 * **Estas tres llamadas no van al mismo proceso que el resto de la aplicación.** Pagos vive en
 * `ecopedia-integration`, en el puerto 8083, mientras que estaciones y usuarios están en
 * `ecopedia-core`, en el 8081 (ARQUITECTURA §6.4). En desarrollo eso no se ve porque el proxy
 * de Vite reparte por prefijo, pero es real: el día que Pagos cambie de dirección, el cambio
 * entra por acá y ningún componente se entera.
 *
 * En producción todavía no hay quién reparta. El JAR del perfil `web` sirve el frontend y la API
 * de core, así que estas rutas le pegan a core y dan 404 hasta que exista un reverse proxy
 * delante de los dos artefactos. Está anotado como pendiente en el README, sección "Producción:
 * un solo artefacto".
 *
 * **El conductor dueño no viaja en ninguna de las tres.** Sale del token, que es lo único que
 * el cliente no puede falsificar. Ver `PaymentMethodController`.
 */

/**
 * Da de alta una tarjeta y devuelve lo que quedó guardado.
 *
 * El número va en el cuerpo de esta llamada y no vuelve nunca: lo que responde el backend son
 * marca, últimos cuatro y vencimiento. Es el único momento de la aplicación en el que el número
 * completo sale del navegador.
 */
export function registerCard(input: RegisterCardInput): Promise<PaymentMethod> {
  return api.post<PaymentMethod>('/payment-methods', input)
}

/** Las tarjetas vigentes del conductor, de la más nueva a la más vieja. */
export function listCards(signal?: AbortSignal): Promise<PaymentMethod[]> {
  return api.get<PaymentMethod[]>('/payment-methods', { signal })
}

/**
 * Da de baja una tarjeta.
 *
 * La baja es lógica del lado del servidor —los cobros históricos cuelgan del token— pero para
 * la pantalla es una eliminación: deja de listarse y no se puede recuperar desde acá.
 */
export function removeCard(cardId: number): Promise<void> {
  return api.delete(`/payment-methods/${cardId}`)
}
