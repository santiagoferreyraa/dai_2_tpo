/**
 * "Tu actividad", tapada: un adelanto borroneado de lo que va a ir acá.
 *
 * **El dibujo de atrás es de mentira y por eso está borroso.** Los kWh de una sesión los acumula
 * `ChargingSessionService` con la telemetría que llega por el tópico (RF16), y ese servicio no
 * existe: nadie tiene cargas hechas. Mostrar barras nítidas con números sería exactamente lo que
 * `chargingActivity.ts` argumenta que no hay que hacer.
 *
 * Una barra borroneada no afirma ningún valor —no se puede leer, y esa es la idea—, así que
 * funciona como lo que es: la forma de la información futura, no la información.
 *
 * La cinta, el desenfoque y el rótulo para lectores de pantalla los pone `TapedCard`. Acá vive
 * solo lo que este recuadro tiene de propio: qué se ve detrás.
 *
 * Cuando el servicio entre, este recuadro se reemplaza por el gráfico de verdad, con los kWh
 * que devuelva la API.
 */

import { ChartIcon } from '@/features/navigation/icons'

import TapedCard from './TapedCard'

/**
 * Las alturas de las barras del adelanto, en porcentaje.
 *
 * Escritas a mano y no al azar: `Math.random()` daría un dibujo distinto en cada render, y una
 * decoración que se mueve sola llama la atención justo donde no hay nada que mirar.
 */
const PREVIEW_BARS = [38, 62, 45, 78, 30, 88, 55]

export default function ActivityTeaser({ className = '' }: { className?: string }) {
  return (
    <TapedCard
      label="Tu actividad: cuánta energía cargaste, día por día. Próximamente."
      className={className}
    >
      <div>
        <ChartIcon className="text-primary h-10 w-10" />

        <p className="text-text mt-3 text-lg leading-snug font-bold text-balance">Tu actividad</p>

        <p className="text-text-muted mt-1 text-sm text-pretty">
          Cuánta energía cargaste, día por día. Llega con las sesiones de carga.
        </p>
      </div>

      {/* La silueta de un gráfico, no un gráfico. Ver el comentario de arriba. */}
      <div className="flex h-20 items-end gap-2">
        {PREVIEW_BARS.map((height, index) => (
          <div
            key={index}
            className="brand-fill flex-1 rounded-t-md opacity-45"
            style={{ height: `${String(height)}%` }}
          />
        ))}
      </div>
    </TapedCard>
  )
}
