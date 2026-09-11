/**
 * La próxima carga del conductor: la reserva que viene, o la sesión que está corriendo.
 *
 * **Hoy devuelve siempre "no hay nada", y eso NO es un dato de relleno: es la verdad.** Las
 * reservas las maneja `BookingService` (RF08) y las sesiones `ChargingSessionService` (RF11,
 * RF12), y ninguno de los dos existe todavía —ni el endpoint, ni la pantalla para crear una—.
 * Nadie puede tener una reserva, así que "todavía no tenés ninguna" es cierto para todo el mundo.
 *
 * Los otros dos estados están escritos igual, y esa es la parte que importa: la tarjeta ya sabe
 * dibujarlos. Cuando esos servicios entren, lo único que cambia es el cuerpo de `useNextCharge`
 * —una llamada en vez de un valor fijo—, y ni la tarjeta ni la portada se enteran.
 *
 * La alternativa era mostrar una reserva de ejemplo para que la demo se viera llena. Se descartó
 * por la misma razón de siempre: una pantalla que inventa el turno de las 18:30 es la que después
 * nadie puede explicar, y peor todavía en una tarjeta cuyo propósito es que el conductor confíe en
 * lo que dice.
 */

/** Una reserva confirmada que todavía no empezó (RF08). */
export interface ReservedCharge {
  kind: 'reserved'
  stationName: string
  connectorLabel: string
  /** Inicio y fin de la ventana reservada. */
  from: Date
  to: Date
}

/** Una sesión de carga en curso (RF12). */
export interface ActiveCharge {
  kind: 'charging'
  stationName: string
  /** Porcentaje actual de la batería y el objetivo que fijó el conductor. */
  batteryPercent: number
  targetPercent: number
  deliveredKWh: number
  powerKw: number
}

export type NextCharge = { kind: 'none' } | ReservedCharge | ActiveCharge

export function useNextCharge(): NextCharge {
  /*
    Es un hook y no una constante aunque hoy no use ningún hook adentro. Es para que el día que
    esto pase a pedirle datos al backend, quien lo usa no tenga que cambiar: hoy `useNextCharge()`
    y mañana también, con estados de carga adentro en vez de un valor fijo.
  */
  return { kind: 'none' }
}
