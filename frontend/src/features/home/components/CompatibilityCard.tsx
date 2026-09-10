/**
 * "12 de 15 estaciones cargan tu CCS2": cuánto de la red le sirve al auto del conductor.
 *
 * **La jerarquía está dada vuelta respecto de la primera versión, y ese es el punto del
 * recuadro.** Antes el renglón grande decía "tu auto es compatible con CCS2" y el conteo iba
 * chiquito al pie. Pero el conector ya está escrito en la ficha del auto, dos recuadros a la
 * izquierda, así que lo grande repetía algo que el ojo acababa de leer y lo único nuevo estaba
 * en la letra chica.
 *
 * Ahora manda el número, que es lo que NINGÚN otro lugar de la portada dice: cuántas estaciones
 * de la red le sirven a este auto. El conector queda como la explicación de ese número —"de las
 * que cargan tu CCS2"— en vez de ser el dato.
 *
 * **Y abajo va cuántas están libres AHORA**, que es otra pregunta: una dice si el auto encaja en
 * la red, la otra si se puede salir a cargar en este momento. Por eso `homeStations` las cuenta
 * por separado.
 *
 * El escudo se queda: no está diciendo "CCS2", está diciendo "esto te sirve", que es justamente
 * lo que el número de al lado cuantifica.
 *
 * La disposición —ícono a la izquierda, texto a la derecha— es la misma de `ChargeTimeCard`, con
 * la que comparte fila. Ver el comentario de abajo.
 *
 * **El cuerpo se exporta aparte de la tarjeta**, y no es una abstracción de más: hoy el recuadro
 * está tapado con la cinta en la portada, y `TapedCard` necesita el contenido SIN su cáscara de
 * vidrio —si no, quedaría una tarjeta adentro de otra, con dos bordes y dos sombras—. La tarjeta
 * completa se deja exportada y entera para el día que se decida qué va en ese lugar: si termina
 * siendo esto, se saca la cinta y vuelve tal cual estaba.
 */

import { ShieldCheckIcon } from '@/features/navigation/icons'

import { DRIVER_VEHICLE } from '../vehicle'

/** Cómo se lee cada tipo de conector. El enum viaja en inglés técnico. */
const CONNECTOR_NAME: Record<string, string> = {
  CCS2: 'CCS2',
  CHADEMO: 'CHAdeMO',
  TYPE_2: 'Tipo 2',
}

interface CompatibilityCardProps {
  /** Cuántas estaciones tienen al menos un conector del tipo que usa el auto. */
  compatibleCount: number
  /** Cuántas de esas tienen uno libre ahora mismo. */
  usableCount: number
  /** Cuántas estaciones hay en total. */
  totalCount: number
  className?: string
}

export function CompatibilityBody({
  compatibleCount,
  usableCount,
  totalCount,
}: CompatibilityCardProps) {
  const connector = CONNECTOR_NAME[DRIVER_VEHICLE.connectorType] ?? DRIVER_VEHICLE.connectorType

  return (
    /*
      Ícono a la izquierda y texto a la derecha, alineado al margen: exactamente la misma
      anatomía que "Cuánto tarda tu carga", que es su vecino de fila.

      Centrado se veía bien solo: puesto al lado del otro, dos recuadros con la misma jerarquía
      y distinta disposición se leen como dos piezas de sistemas diferentes. Compartir el eje
      —ícono, después texto— es lo que los vuelve una fila y no dos tarjetas sueltas, y de paso
      alinea los dos íconos a la misma altura de un vistazo.
    */
    <div className="flex h-full items-center gap-5">
      {/*
        El escudo va grande y suelto, sin recuadro ni fondo propio, y del MISMO tamaño que el
        reloj de al lado: es el mismo tratamiento que tienen los íconos de la ficha del vehículo,
        así que los tres se leen como la misma familia.
      */}
      <ShieldCheckIcon className="text-primary h-16 w-16 shrink-0" />

      <div className="min-w-0">
        {totalCount === 0 ? (
          /*
            Mientras no hay estaciones cargadas no se dibuja ningún número. "0 de 0" diría algo
            falso —que ninguna te sirve— justo cuando la verdad es que todavía no se sabe.
          */
          <p className="text-text text-lg leading-snug font-bold text-balance">
            Tu auto usa <span className="text-primary">{connector}</span>
          </p>
        ) : (
          <>
            <p className="text-text text-3xl leading-none font-extrabold tracking-tight">
              {compatibleCount} <span className="text-text-muted text-xl">de</span> {totalCount}
            </p>

            <p className="text-text mt-1 text-sm leading-snug font-semibold text-pretty">
              estaciones cargan tu <span className="text-primary">{connector}</span>
            </p>

            {/*
              El renglón de abajo cambia de color con lo que dice, y no es adorno: en verde es una
              invitación —hay dónde ir ahora— y apagado es una advertencia. Un mismo gris para los
              dos casos obligaría a leer el número para saber cuál de las dos cosas está pasando.
            */}
            <p
              className={`mt-1 text-xs font-semibold ${usableCount > 0 ? 'text-primary' : 'text-text-muted'}`}
            >
              {usableCount > 0
                ? `${String(usableCount)} con enchufe libre ahora`
                : 'Ninguna con enchufe libre ahora'}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

/** La misma cosa con su tarjeta de vidrio, para cuando el recuadro deje de estar tapado. */
export default function CompatibilityCard({
  className = '',
  ...body
}: CompatibilityCardProps & { className?: string }) {
  return (
    <article className={`glass-panel flex items-center gap-5 rounded-3xl p-6 ${className}`}>
      <CompatibilityBody {...body} />
    </article>
  )
}
