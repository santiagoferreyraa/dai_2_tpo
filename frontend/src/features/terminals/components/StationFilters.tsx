/**
 * Los filtros del mapa: tipo de conector y potencia mínima, como burbujas al lado del buscador.
 *
 * Son los mismos dos filtros del ABM, y a propósito: quien administra estaciones y quien busca
 * dónde cargar filtran por lo mismo, así que no tiene sentido que cada pantalla invente su
 * criterio. Lo que comparten de verdad es `matchesFilters`, en format.ts; acá solo está la
 * forma que toman sobre el mapa.
 *
 * Redondeadas del todo, igual que el buscador: sobre el mapa todo lo que flota es del mismo
 * material, y un rectángulo al lado de una píldora se lee como de otra pantalla.
 *
 * Cada burbuja es su propio recuadro en vez de ir todas dentro de una barra: una barra sola
 * sobre el mapa se leería como un control con estado propio, y no lo es —son seis interruptores
 * sueltos—.
 *
 * De tablet para arriba encabezan la fila, en el lugar que dejó libre el buscador del mapa
 * cuando se sacó por repetido. No se dibujan en celular —quien lo monta decide con
 * `hidden md:flex`—: ahí el buscador ya se pliega a una burbuja para no comerse el mapa, y seis
 * filtros más al lado harían justo lo que ese plegado evita.
 */

import { CONNECTOR_TYPES, CONNECTOR_TYPE_LABEL, POWER_STEPS } from '../format'
import type { ConnectorFilters } from '../format'
import type { ConnectorType } from '../types'

interface StationFiltersProps {
  value: ConnectorFilters
  onChange: (next: ConnectorFilters) => void
}

/**
 * El estilo de una burbuja según esté activa o no.
 *
 * `shrink-0` y `whitespace-nowrap` porque el contenedor puede quedar más angosto que la fila:
 * sin eso "150+ kW" se parte en dos renglones y la burbuja crece hacia abajo.
 */
function chipClass(active: boolean): string {
  return `shrink-0 rounded-full border px-3 py-2 text-xs whitespace-nowrap shadow-lg backdrop-blur transition-colors ${
    active
      ? 'border-primary bg-primary font-bold text-[#12251a]'
      : 'border-border bg-surface/95 text-text-muted hover:text-text'
  }`
}

export default function StationFilters({ value, onChange }: StationFiltersProps) {
  const { connectorType, minPowerKw } = value
  const filtering = connectorType !== null || minPowerKw !== null

  /* Volver a tocar el filtro activo lo apaga: es el camino corto a "todas" sin cruzar la fila. */
  const toggleType = (type: ConnectorType) =>
    onChange({ ...value, connectorType: connectorType === type ? null : type })

  const togglePower = (step: number) =>
    onChange({ ...value, minPowerKw: minPowerKw === step ? null : step })

  return (
    <>
      <button
        type="button"
        onClick={() => onChange({ connectorType: null, minPowerKw: null })}
        aria-pressed={!filtering}
        className={chipClass(!filtering)}
      >
        Todas
      </button>

      {CONNECTOR_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => toggleType(type)}
          aria-pressed={connectorType === type}
          className={chipClass(connectorType === type)}
        >
          {CONNECTOR_TYPE_LABEL[type]}
        </button>
      ))}

      {/* Separador entre las dos dimensiones del filtro: tipo de conector y potencia. */}
      <span aria-hidden="true" className="bg-border h-5 w-px shrink-0" />

      {POWER_STEPS.map((step) => (
        <button
          key={step}
          type="button"
          onClick={() => togglePower(step)}
          aria-pressed={minPowerKw === step}
          className={chipClass(minPowerKw === step)}
        >
          {step}+ kW
        </button>
      ))}
    </>
  )
}
