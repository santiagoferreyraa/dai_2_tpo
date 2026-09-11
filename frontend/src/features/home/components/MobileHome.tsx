import { Link } from 'react-router'

import { useSession } from '@/features/auth/session'
import SearchBox from '@/features/navigation/SearchBox'
import { displayNameFrom } from '@/lib/displayName'

import NearestStationStack from './NearestStationStack'
import ReservationGuide from './ReservationGuide'
import StationTicker from './StationTicker'
import VehicleHero from './VehicleHero'

import { useHomeStations } from '../data/homeStations'
import { greetingFor } from '../greeting'

/**
 * La portada del celular.
 *
 * Es una pantalla distinta de la de escritorio, no la misma achicada, y el orden dice por qué:
 * arriba de todo el saludo y el buscador —lo primero que alguien quiere hacer desde el teléfono es
 * encontrar dónde cargar—, abajo el auto, y recién después lo que explica y lo que invita.
 *
 * **Son las mismas piezas que la portada grande, en otro orden y sin las que no entran.** El
 * buscador, el recuadro del auto y la cinta de estaciones son literalmente los mismos
 * componentes; cada uno ya sabe angostarse. El mapa de la más cercana comparte los datos y los
 * estados de espera con el de escritorio, pero acá se dibuja en dos capas —ver
 * `NearestStationStack`—. Lo único propio del celular es el carrusel didáctico, porque en
 * pantalla grande ese lugar lo ocupa el argumento largo del recuadro del auto.
 *
 * Lo que quedó afuera —el tiempo de carga, la actividad, la compatibilidad— es la fila del medio
 * de escritorio: tres recuadros de datos secundarios que en una columna sola empujan el mapa
 * fuera de la pantalla, que es lo último que conviene esconder en un teléfono.
 *
 * **Los datos salen de UNA sola carga**, igual que en escritorio: `useHomeStations` pide las
 * estaciones una vez y de ahí salen la cinta y el mapa de la más cercana.
 */
export default function MobileHome() {
  const { stations, nearest, deviceLocation, loading, error } = useHomeStations()
  const session = useSession()

  const greeting = greetingFor(new Date().getHours())

  return (
    <div className="flex flex-col gap-8 px-5 pt-6 pb-36">
      {/*
        El saludo y la pregunta, arriba de todo.

        **Encabezan la pantalla y no el recuadro del auto**, que es donde viven en escritorio. Acá
        lo primero que se ve tiene que decir qué se hace en esta pantalla, y lo que sigue —el
        buscador— es justamente la respuesta a la pregunta del título. El recuadro del auto se
        guarda el suyo para la pantalla grande; ver `VehicleHero`.
      */}
      <header>
        <p className="text-text-muted text-sm">
          {session === null ? greeting : `${greeting}, ${displayNameFrom(session.email)}`} 👋
        </p>
        <h1 className="text-text mt-1 text-3xl leading-tight font-extrabold tracking-tight text-balance">
          ¿Dónde cargamos hoy?
        </h1>
      </header>

      <SearchBox />

      <VehicleHero />

      {/*
        La cinta se desborda a los costados con `-mx-5` para que las fichas entren y salgan por el
        borde del teléfono. Cortadas contra el margen de la columna se leerían como una lista
        recortada y no como algo que sigue de largo.
      */}
      <StationTicker stations={stations} className="-mx-5" />

      <ReservationGuide />

      <section>
        {/*
          El título y el botón, en la misma línea.

          El título se lleva todo el ancho que le sobre al botón —de ahí el `flex-1`— y el botón
          no se encoge nunca: "Ver más" con una palabra por renglón no es un botón.

          **Sin `text-balance`, y por eso.** Esa propiedad reparte la frase en renglones parejos,
          y en un título de dos líneas eso deja el primero corto: el texto termina lejos del botón
          y el bloque se ve angosto en una fila que sí es ancha. Sin ella, el primer renglón se
          llena hasta donde empieza el botón.

          **La frase es corta porque tiene que entrar en un renglón.** "Encontrá ya tu estación
          más cercana" medía 338 píxeles al tamaño de este título, y el hueco que deja el botón en
          un teléfono de 375 son 238: no entraba ni bajándola por debajo del tamaño del texto
          común. Lo que decide es la cantidad de palabras, así que el renglón único se ganó
          sacando tres, no achicando la letra.

          El botón va centrado contra el título. Con el título en un solo renglón, alinearlos por
          abajo dejaba el botón —que es más alto— colgando de la línea de base del texto.
        */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-text flex-1 text-xl leading-tight font-extrabold tracking-tight">
            Tu estación más cercana
          </h2>

          <Link
            to="/stations/map"
            className="brand-fill text-on-primary shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            Ver más
          </Link>
        </div>

        <div className="mt-3">
          <NearestStationStack
            nearest={nearest}
            stations={stations}
            deviceLocation={deviceLocation}
            loading={loading}
          />
        </div>
      </section>

      {/*
        El fallo del backend va al final y no arriba, por lo mismo que en escritorio: la portada
        no se rompe sin estaciones —el buscador y el auto siguen en pie—, pero quien ve la cinta
        vacía y el mapa sin estación tiene que entender que el problema es la conexión.
      */}
      {error !== null && (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
