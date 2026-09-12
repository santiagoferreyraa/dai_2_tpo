import { useCallback, useRef, useState } from 'react'

import { ClockIcon, MapIcon, PlugIcon } from '@/features/navigation/icons'

/**
 * El carrusel didáctico: cómo funciona reservar un conector, en tres pasos.
 *
 * **Es la única parte de la portada que explica en vez de mostrar**, y existe porque reservar es
 * lo que la aplicación hace y no se deduce mirando un mapa. Va en el celular y no en escritorio:
 * en pantalla grande el argumento largo ya lo da el recuadro del auto, y acá abajo hay lugar
 * justo para una tarjeta por vez.
 *
 * **Se avanza de a un paso, con el dedo o tocando los puntos.** El desplazamiento es el del
 * navegador —`scroll-snap`, no un `transform` calculado a mano—, así que el arrastre con el dedo,
 * la inercia y el freno en cada paso salen gratis y se sienten como los del sistema. Lo único que
 * agrega React es saber en qué paso estamos: de eso viven el punto encendido y el realce de la
 * tarjeta del medio.
 *
 * Los pasos describen el flujo que pide el sistema —conectores por tipo y estado, la ventana
 * reservada y los quince minutos de tolerancia—, no una pantalla concreta: cuando entre
 * `BookingService` esto ya cuenta lo que va a pasar.
 *
 * **Son tres pasos porque hay tres fotos.** El número no salió de dividir el flujo: las fotos son
 * el fondo de las tarjetas y una tarjeta sin foto, al lado de otras que sí la tienen, se lee como
 * un error. Elegir el conector y fijar la ventana entran juntos en un paso sin forzar nada —son
 * dos decisiones de la misma pantalla—, así que el flujo entero sigue estando.
 */

interface Step {
  Icon: (props: { className?: string }) => React.ReactElement
  title: string
  body: string
  /**
   * La foto del fondo.
   *
   * Va desde `public/` y no importada por el empaquetador a propósito, igual que el auto de
   * `VehicleHero`: entra como fondo de CSS, así que si el archivo no está la tarjeta se dibuja
   * igual —queda el velo oscuro solo— en vez de mostrar el ícono de imagen rota del navegador
   * justo debajo del texto que se está tratando de leer.
   */
  image: string
}

const STEPS: Step[] = [
  {
    Icon: MapIcon,
    title: 'Buscá dónde cargar',
    body: 'Abrí el mapa y mirá las estaciones que tenés cerca. Cada una dice qué conectores tiene y cuáles están libres ahora.',
    image: '/reserva-buscar.webp',
  },
  {
    Icon: PlugIcon,
    title: 'Reservá el conector',
    body: 'Elegí el enchufe que le sirve a tu auto y desde qué hora hasta cuál lo querés. Mientras dure, queda a tu nombre.',
    image: '/reserva-conector.webp',
  },
  {
    Icon: ClockIcon,
    title: 'Llegá y enchufá',
    body: 'Tenés 15 minutos de tolerancia desde que empieza tu turno. Pasados, el conector vuelve a quedar libre para otro.',
    image: '/reserva-llegar.webp',
  },
]

/**
 * Cuánto se corre la cinta al pasar de un paso al siguiente.
 *
 * **No es el ancho visible.** La tarjeta mide menos —las vecinas asoman—, entre una y otra hay
 * una separación y la cinta tiene relleno en los costados: tres números que este archivo no
 * tiene por qué conocer, porque los pone Tailwind. Multiplicar por el ancho visible dejaba cada
 * salto corrido, y como el freno del navegador cae siempre en una tarjeta entera, el error
 * acumulado alcanzaba para saltearse un paso.
 *
 * Así que se mide, y de la forma que no depende de nada de eso: la distancia entre el borde de
 * una tarjeta y el de la siguiente ES el salto. Las dos se miden contra el mismo origen, así que
 * la resta es exacta sin importar dónde esté ese origen.
 *
 * Con menos de dos tarjetas no hay salto posible, y el ancho visible sirve de respuesta
 * cualquiera —no se va a usar—.
 */
function strideOf(track: HTMLElement): number {
  const [first, second] = track.children
  if (first === undefined || second === undefined) return track.clientWidth
  return (second as HTMLElement).offsetLeft - (first as HTMLElement).offsetLeft
}

export default function ReservationGuide({ className = '' }: { className?: string }) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [index, setIndex] = useState(0)

  /*
   * En qué paso estamos, leído del scroll y no guardado aparte.
   *
   * Es la fuente de verdad porque el dedo también mueve la cinta: un índice propio se
   * desincronizaría en cuanto alguien arrastre en vez de tocar la flecha.
   */
  const syncIndex = useCallback(() => {
    const track = trackRef.current
    if (track === null) return
    setIndex(Math.round(track.scrollLeft / strideOf(track)))
  }, [])

  const goTo = useCallback((step: number) => {
    const track = trackRef.current
    if (track === null) return
    track.scrollTo({ left: step * strideOf(track), behavior: 'smooth' })
  }, [])

  return (
    <section className={className} aria-labelledby="reservation-guide-title">
      {/*
        El título va con las mismas medidas que el de "Encontrá ya tu estación más cercana": son
        los dos encabezados de sección de la portada y, con tamaños distintos, el más chico se lee
        como si dependiera del otro en vez de estar a su lado.
      */}
      <h2
        id="reservation-guide-title"
        className="text-text text-xl leading-tight font-extrabold tracking-tight"
      >
        Cómo funciona una reserva
      </h2>

      {/*
        La cinta se desborda a los costados con `-mx-5` para que las tarjetas vecinas asomen contra
        el borde del teléfono y no contra el margen de la columna: asomando desde el borde se leen
        como una fila que sigue, y cortadas adentro de la página, como tarjetas rotas.
      */}
      <ul
        ref={trackRef}
        onScroll={syncIndex}
        /*
          El relleno de los costados es lo que permite CENTRAR la primera tarjeta y la última.
          Con `snap-center`, el navegador alinea el centro de la tarjeta con el centro de la
          cinta, y para la primera eso pediría un desplazamiento negativo —imposible— si no
          hubiera lugar de sobra a la izquierda. El relleno es ese lugar.

          **Y por eso la tarjeta es `w-full` y no un porcentaje.** Un ancho en porcentaje se mide
          contra la caja de contenido, que es lo que queda DESPUÉS de descontar este relleno: un
          76% ahí adentro no da el 76% de la pantalla, y la cuenta para centrar deja de cerrar
          —era lo que dejaba la tarjeta corrida a la izquierda—. `w-full` es exactamente esa caja,
          así que relleno + tarjeta + relleno da la pantalla entera y el centro cae solo, sin que
          importe contra qué mide el navegador ese 12%. Lo que asoma de las vecinas es el relleno
          menos la separación: unos treinta píxeles de cada lado en un teléfono.
        */
        className="swipe-track -mx-5 mt-3 flex gap-3 px-[12%]"
        /* La lista entera es el blanco del dedo, así que se anuncia como una sola cosa. */
        aria-label="Los tres pasos de una reserva"
      >
        {STEPS.map((step, position) => (
          <li
            key={step.title}
            /*
              **La tarjeta no ocupa el ancho entero: deja ver las vecinas.** Ese pedazo asomando
              es lo que dice que hay más pasos sin necesidad de explicarlo, y es lo que convierte
              el bloque en algo que se arrastra a la vista de cualquiera.

              La que no está elegida se achica y se apaga. Es la misma jerarquía que ya usa el
              carrusel del mapa: el foco está en una por vez y las otras siguen ahí. Como la
              escala es un `transform`, la fila no se recalcula al cambiar de paso —lo que se
              mueve es el dibujo, no el espacio que ocupa—, y por eso el freno del scroll no se
              corre.

              `justify-end` apoya el texto contra el borde de abajo: es donde el velo es más
              denso y, en las tres fotos, donde menos pasa. Y el alto mínimo no es decorativo
              —abajo de esto la foto deja de leerse como foto y pasa a ser una textura—.

              La tarjeta es oscura en los dos temas, como el recuadro del auto: sobre una foto la
              tinta no puede cambiar con el tema, así que el fondo tampoco.
            */
            className={`relative flex min-h-64 w-full shrink-0 snap-center flex-col justify-end overflow-hidden rounded-3xl bg-cover bg-center p-5 transition duration-300 ${
              position === index ? '' : 'scale-95 opacity-60'
            }`}
            style={{ backgroundImage: `url("${step.image}")` }}
          >
            {/*
              El velo, en dos capas y con dos trabajos distintos.

              La de abajo es la que hace legible el texto: un degradado oscuro que arranca casi
              opaco en el piso y se abre hacia arriba, así que el texto apoya sobre negro y la
              foto se sigue viendo entera en la mitad de arriba. Un velo parejo habría tapado la
              foto para lograr lo mismo.

              La de encima es color y no contraste: una diagonal del verde de la marca al azul
              del fondo de la aplicación, muy tenue. Es lo que ata tres fotos que vienen de
              lugares distintos —dos autos grises y una pared de ladrillo— a la misma pantalla.
            */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20"
            />
            <div
              aria-hidden="true"
              className="from-primary/20 absolute inset-0 bg-gradient-to-br via-transparent to-[#101725]/55"
            />

            {/* `relative` para que el texto quede por encima de las dos capas del velo. */}
            <div className="relative">
              <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wide text-white/75 uppercase">
                <step.Icon className="text-primary h-4 w-4" />
                Paso {position + 1} de {STEPS.length}
              </p>

              <p className="mt-1.5 text-xl leading-tight font-extrabold tracking-tight text-white">
                {step.title}
              </p>

              <p className="mt-2 text-sm leading-relaxed text-white/85">{step.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {/*
        Los puntos, y son el único control.

        **Las dos flechas se fueron.** Con las tarjetas vecinas asomando, el gesto ya está dicho
        por el dibujo: se ve que hay algo al costado y se arrastra. Las flechas repetían eso
        ocupando un renglón entero.

        Que se puedan tocar es lo que las reemplaza: son botones de verdad —blanco de 44 píxeles,
        con el punto dibujado adentro— así que el carrusel sigue siendo manejable con el dedo sin
        arrastrar y con el teclado. El rótulo lo dice en palabras, que es lo que escucha un lector
        de pantalla en lugar del color.
      */}
      <div className="mt-3 flex items-center justify-center">
        {STEPS.map((step, position) => (
          <button
            key={step.title}
            type="button"
            onClick={() => {
              goTo(position)
            }}
            aria-label={`Paso ${String(position + 1)}: ${step.title}`}
            aria-current={position === index}
            className="focus-visible:outline-primary group flex h-11 w-6 items-center justify-center rounded-full focus-visible:outline-2"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                position === index
                  ? 'bg-primary w-5'
                  : 'bg-text-muted/30 group-hover:bg-text-muted/60 w-1.5'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
