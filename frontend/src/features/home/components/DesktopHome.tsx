import ActivityTeaser from './ActivityTeaser'
import ChargeTimeCard from './ChargeTimeCard'
import { CompatibilityBody } from './CompatibilityCard'
import EvFactCard from './EvFactCard'
import NearestStationCard from './NearestStationCard'
import StationTicker from './StationTicker'
import TapedCard from './TapedCard'
import VehicleHero from './VehicleHero'

import { useSession } from '@/features/auth/session'

import { useHomeStations } from '../data/homeStations'

/**
 * La portada de escritorio y tablet.
 *
 * **Responde "¿cuándo y dónde cargo?", no "¿cómo es la red?".** Esa distinción es la que decidió
 * qué se fue: el reparto de conectores por tipo, la potencia máxima de la plataforma y el total de
 * conectores libres eran datos ciertos, pero de infraestructura. Al conductor no le resuelven nada
 * —su pregunta es dónde puede cargar ahora— y al operador sí, así que se mudaron a Estaciones, que
 * ya es su pantalla.
 *
 * Lo que queda son cinco cosas y todas miran al conductor: su auto, dónde cargarlo ahora, si el
 * enchufe le sirve, cuánto va a tardar y qué otras estaciones hay.
 *
 * **Todos los datos salen de UNA sola carga.** `useHomeStations` pide las estaciones una vez y de
 * ahí salen los tres recuadros que hablan de ellas. La distancia se calcula en el navegador, así
 * que moverse con el GPS prendido reordena la portada sin un solo pedido de red. El porqué está
 * en `terminals/geo.ts`.
 *
 * **Dos recuadros de la fila del medio están tapados con la cinta, y por motivos distintos.**
 * Actividad porque el dato no existe —depende de las sesiones de carga, RF11/RF12/RF16—, y
 * compatibilidad porque el dato existe pero todavía no está decidido si es lo que conviene decir
 * en ese lugar. El tratamiento es el mismo y lo pone `TapedCard`: desenfoque sobre todo el
 * contenido, cinta nítida encima. Lo que cambia es la inclinación de la cinta, para que dos
 * tarjetas vecinas no se lean como una sola faja cruzando la fila.
 */
export default function DesktopHome() {
  const { stations, nearest, compatibleCount, usableCount, deviceLocation, loading, error } =
    useHomeStations()
  const session = useSession()

  return (
    /*
      Sin ancho máximo y con el MISMO `px-6` que la franja de arriba: así los recuadros arrancan y
      terminan exactamente donde el buscador y la ficha del perfil, y la pantalla se lee como una
      sola pieza en vez de una barra ancha con una columna angosta debajo.
    */
    <div className="flex w-full flex-col gap-5 px-6 pt-6 pb-10">
      {/*
        La grilla de tres columnas, y la clave de la disposición está en la columna DERECHA: la
        estación más cercana y la compatibilidad se apilan ahí y juntas miden lo mismo que el auto
        más la fila de abajo. Por eso el auto ocupa dos columnas y no tres.

        Debajo de `xl` todo pasa a una sola columna. En un ancho intermedio, tres columnas dejan
        el mapa chico convertido en una estampilla y el nombre de la estación cortado a la mitad.
      */}
      <div className="grid gap-5 xl:grid-cols-3">
        <VehicleHero className="xl:col-span-2" />

        <NearestStationCard
          nearest={nearest}
          stations={stations}
          deviceLocation={deviceLocation}
          loading={loading}
        />

        {/*
          La fila de abajo. `xl:col-span-2` repartido entre dos recuadros deja a la
          compatibilidad justo debajo del mapa chico, cerrando la columna derecha.
        */}
        {/*
          El tiempo de carga solo con sesión. Sin ella, ese recuadro afirma "tu auto tarda tanto"
          sobre un vehículo que nadie declaró —el número sale de la ficha de ejemplo de
          `vehicle.ts`—, así que en su lugar va una curiosidad, que es algo cierto para
          cualquiera. Ver `EvFactCard`.
        */}
        {session === null ? <EvFactCard /> : <ChargeTimeCard nearest={nearest} loading={loading} />}
        <ActivityTeaser />
        {/*
          Tapado como Actividad, y por decisión de producto: los números de adentro son reales,
          pero todavía no está resuelto qué conviene que diga este lugar. La cinta es lo que dice
          "acá falta decidir algo" sin sacar el recuadro de la grilla, que es lo que dejaría la
          fila coja.

          El ángulo va al revés que el de Actividad. Con los dos iguales, las cintas de dos
          tarjetas vecinas se alinean y se leen como una sola faja cruzando la fila entera.
        */}
        <TapedCard label="Compatibilidad de tu vehículo con la red. Próximamente." tapeAngle="9deg">
          <CompatibilityBody
            compatibleCount={compatibleCount}
            usableCount={usableCount}
            totalCount={stations.length}
          />
        </TapedCard>
      </div>

      {/*
        El único lugar de la portada donde aparece un fallo del backend.

        Va acá abajo y no arriba de todo a propósito: la portada NO se rompe sin estaciones —el
        auto, el conector y la explicación del producto siguen en pie—, así que un cartel rojo
        encabezando la pantalla exageraría lo que pasó. Lo que sí hace falta es que quien ve tres
        recuadros diciendo "no hay estación" entienda que el problema es la conexión y no la red
        de carga.
      */}
      {error !== null && (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      )}

      {/* La cinta de estaciones: la última oportunidad de mandar al mapa, y la más concreta —cada
          ficha es una estación de verdad y lleva a la suya. */}
      <StationTicker stations={stations} className="-mx-6" />
    </div>
  )
}
