/**
 * Cuánta energía cargó el conductor, día por día.
 *
 * **Hoy devuelve una lista vacía, y es la verdad.** Los kWh de una sesión los acumula
 * `ChargingSessionService` con la telemetría que llega por el tópico (RF16) y quedan en el
 * resumen que se factura (RF14). Nada de eso existe todavía, así que nadie tiene cargas hechas y
 * la tarjeta lo dice con todas las letras en vez de dibujar barras inventadas.
 *
 * Cuando el servicio entre, cambia el cuerpo de esta función y la tarjeta se llena sola.
 *
 * **Se eligió la energía y no el gasto**, entre las dos opciones que tenían sentido. El gasto
 * depende del esquema tarifario que cada CPO define para sus conectores (RF06), así que dos
 * cargas iguales en estaciones distintas cuestan distinto y el gráfico mezclaría el hábito del
 * conductor con la política de precios de terceros. Los kWh son suyos y solo suyos.
 */

export interface DailyEnergy {
  /** Etiqueta corta del día, como se muestra en el eje. */
  label: string
  kWh: number
}

export function useChargingActivity(): DailyEnergy[] {
  /* Ver arriba: es un hook para que el día que pida datos no cambie quien lo usa. */
  return []
}
