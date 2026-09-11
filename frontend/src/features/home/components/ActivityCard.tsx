import { BoltIcon } from '@/features/navigation/icons'

import { useChargingActivity } from '../data/chargingActivity'
import CellChart from './CellChart'

/**
 * Cuánta energía cargó el conductor en los últimos días.
 *
 * **Hoy está vacía, y lo dice.** No hay sesiones de carga en el sistema porque el servicio que las
 * lleva todavía no existe (ver `data/chargingActivity.ts`), así que la tarjeta muestra el estado
 * vacío en vez de barras inventadas. El gráfico está armado y se llena solo el día que haya datos.
 *
 * Es la única gráfica que le queda a la portada del conductor, y a propósito: un gráfico se
 * justifica cuando responde una pregunta que alguien se hace, y "¿cuánto vengo cargando?" es de
 * las pocas que el conductor se hace mirando su propia pantalla. El reparto de conectores de la
 * red responde una pregunta del operador, y por eso se mudó a Estaciones.
 */
export default function ActivityCard({ className = '' }: { className?: string }) {
  const activity = useChargingActivity()

  const total = activity.reduce((sum, day) => sum + day.kWh, 0)

  return (
    <article className={`glass-panel flex flex-col rounded-3xl p-6 ${className}`}>
      <header className="text-text-muted flex items-center gap-2 text-xs font-medium">
        <BoltIcon className="h-4 w-4" />
        Tu actividad
      </header>

      {activity.length === 0 ? (
        <div className="mt-4 flex flex-1 flex-col justify-center">
          <p className="text-text text-lg font-bold">Todavía no cargaste</p>
          <p className="text-text-muted mt-1 max-w-sm text-sm leading-relaxed">
            Cuando hagas tu primera carga vas a ver acá cuánta energía llevás, día por día.
          </p>
        </div>
      ) : (
        <>
          <p className="text-text mt-3 text-3xl font-extrabold tracking-tight">
            {total.toFixed(1)} <span className="text-xl font-bold">kWh</span>
          </p>
          <p className="text-text-muted mt-1 text-xs">en los últimos {activity.length} días</p>

          <CellChart
            className="mt-5"
            cells={activity.map((day) => ({ label: day.label, value: Math.round(day.kWh) }))}
          />
        </>
      )}
    </article>
  )
}
