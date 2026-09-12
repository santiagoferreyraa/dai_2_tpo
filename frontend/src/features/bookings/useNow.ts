import { useEffect, useState } from 'react'

/**
 * La hora actual, recalculada cada `intervalMs`.
 *
 * Existe porque lo que muestra Reservas depende del reloj y no solo de los datos: la cuenta
 * regresiva de la retención, cuánto falta para la reserva y el momento en que una activa pasa al
 * historial. Las reglas (`timeline.ts`, `slots.ts`) reciben `now` en vez de mirar la hora, y este
 * hook es quien se las da a los componentes.
 *
 * El intervalo lo elige quien lo usa: una cuenta regresiva necesita el segundo, una lista de
 * horarios con el minuto le sobra.
 */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
