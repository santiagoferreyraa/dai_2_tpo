/**
 * Carrusel de estaciones, superpuesto sobre el borde derecho del mapa.
 *
 * No es una lista con scroll y ya: la ficha que queda en el centro vertical se ve entera y las
 * demás se achican y se apagan a medida que se alejan. Eso pone el foco en una sola estación
 * por vez sin esconder las otras, que es lo que hace que el mapa siga leyéndose atrás.
 *
 * Va superpuesto y no al costado para no robarle ancho al mapa: el mapa es la pantalla, esto
 * es una capa encima.
 *
 * El scroll es infinito: al pasar la última estación siguen la primera y las que vienen, sin
 * un borde donde la columna se quede vacía. Cómo se consigue está explicado en COPIES.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import StationCard from './StationCard'
import type { StationResult } from './types'

/**
 * Cuánto se encoge y se apaga la ficha más lejana del centro.
 *
 * Están acá y no repartidos por el código porque son el efecto: se tocan estos dos números y
 * cambia el carácter del carrusel entero.
 */
const MIN_SCALE = 0.72
const MIN_OPACITY = 0.25

/**
 * Cuántas veces se repite la lista, una atrás de la otra.
 *
 * El scroll infinito es una ilusión sostenida por dos piezas: la lista está repetida tres
 * veces, y cuando el scroll se sale de la copia del medio se lo corre un bloque entero de
 * golpe. Como lo que se ve después del salto es idéntico a lo que se veía antes, el salto no
 * se percibe: el usuario nunca llega a un borde.
 *
 * Tres y no dos porque hacen falta una copia completa arriba y otra abajo de la visible. Con
 * dos, el salto ocurriría con contenido a la vista y se notaría el corte.
 */
const COPIES = 3

/** Cuánto se espera a que termine un desplazamiento suave antes de volver a acomodar el bloque. */
const SMOOTH_SCROLL_MS = 700

interface StationCarouselProps {
  stations: StationResult[]
  selectedStationId: number | null
  onSelect: (stationId: number) => void
}

/** La clave identifica a una ficha concreta: la misma estación existe una vez por copia. */
function itemKey(copy: number, stationId: number): string {
  return `${copy}:${stationId}`
}

export default function StationCarousel({
  stations,
  selectedStationId,
  onSelect,
}: StationCarouselProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef(new Map<string, HTMLElement>())
  const frameRef = useRef<number | null>(null)

  // Mientras corre un desplazamiento suave no se puede tocar scrollTop: cualquier escritura lo
  // cancela en seco. El salto de bloque queda suspendido hasta que termina.
  const smoothScrollRef = useRef(false)
  const smoothTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /**
   * Si la lista se repite o si es una lista común.
   *
   * Repetir solo tiene sentido cuando un bloque no entra en la columna. Con pocos resultados
   * —el buscador puede dejar uno solo— las tres copias se verían todas a la vez y la misma
   * estación aparecería tres veces, que se lee como un error y no como un carrusel.
   *
   * No se puede decidir por la cantidad de estaciones: cuánto ocupan depende del alto de la
   * ventana y de si hay una ficha desplegada. Se mide después de que el navegador acomodó.
   */
  const [looping, setLooping] = useState(false)

  const firstStationId = stations.length > 0 ? stations[0].stationId : null

  /**
   * Alto de un bloque: la distancia entre la misma ficha en dos copias consecutivas.
   *
   * Se mide en vez de calcularse sumando alturas porque las fichas cambian de alto al
   * desplegarse, y porque entre ellas hay separación: sumar a mano se desincroniza al primer
   * cambio de diseño.
   */
  const blockHeight = useCallback((): number => {
    if (firstStationId === null) return 0
    const first = itemsRef.current.get(itemKey(0, firstStationId))
    const second = itemsRef.current.get(itemKey(1, firstStationId))
    if (first === undefined || second === undefined) return 0
    return second.offsetTop - first.offsetTop
  }, [firstStationId])

  /**
   * Reparte escala y opacidad según la distancia de cada ficha al centro de la columna.
   *
   * Escribe directo sobre el estilo del elemento en vez de pasar por el estado de React: esto
   * corre en cada cuadro del scroll, y volver a renderizar cuarenta y cinco fichas por cuadro
   * se nota.
   *
   * Mide con offsetTop y no con getBoundingClientRect: offsetTop es la posición de diseño,
   * ajena a la escala que este mismo código acaba de aplicar. Midiendo el rectángulo pintado,
   * el efecto se estaría alimentando de su propio resultado.
   */
  const paint = useCallback(() => {
    const list = listRef.current
    if (list === null) return

    const center = list.scrollTop + list.clientHeight / 2
    const reach = list.clientHeight / 2

    for (const element of itemsRef.current.values()) {
      const offset = Math.abs(element.offsetTop + element.offsetHeight / 2 - center)
      const distance = reach === 0 ? 0 : Math.min(1, offset / reach)

      element.style.transform = `scale(${1 - (1 - MIN_SCALE) * distance})`
      element.style.opacity = String(1 - (1 - MIN_OPACITY) * distance)
    }
  }, [])

  /**
   * Devuelve el scroll a la copia del medio cuando se salió de ella.
   *
   * Sin suavizado y a propósito: es un corte instantáneo entre dos vistas idénticas, que es
   * exactamente lo que lo vuelve invisible.
   */
  const recenterBlock = useCallback(() => {
    const list = listRef.current
    if (list === null || smoothScrollRef.current) return

    const block = blockHeight()
    if (block <= 0) return

    // En bucle y no con un solo if: un salto grande de una vez —arrastrar la barra de scroll,
    // o el tope al que el navegador recorta al final del contenido— puede dejar la posición a
    // más de un bloque de distancia, y corrigiendo de a uno se quedaría afuera.
    while (list.scrollTop < block * 0.5) list.scrollTop += block
    while (list.scrollTop > block * 1.5) list.scrollTop -= block
  }, [blockHeight])

  /**
   * Decide si conviene repetir la lista, midiendo lo que ya dibujó el navegador.
   *
   * Las dos condiciones no son la misma al revés: para encender pide un margen del 20 %, y
   * para apagar alcanza con que el bloque entre justo. Esa banda muerta evita que en el borde
   * exacto se prenda y se apague en cada repintado.
   */
  const evaluateLooping = useCallback(() => {
    const list = listRef.current
    if (list === null) return

    if (looping) {
      const block = blockHeight()
      if (block > 0 && block <= list.clientHeight) setLooping(false)
      return
    }

    // Sin repetir, el contenido desplazable ES una copia: si no llena la columna, no hay nada
    // que hacer girar.
    setLooping(list.scrollHeight > list.clientHeight * 1.2)
  }, [blockHeight, looping])

  /**
   * El scroll dispara muchas veces por cuadro; el rAF colapsa la ráfaga en un solo repintado.
   *
   * Cancela el cuadro anterior en vez de descartar el pedido nuevo: si el navegador deja de
   * entregar cuadros —una pestaña en segundo plano no recibe ninguno—, descartando pedidos
   * quedaría una marca puesta para siempre y el efecto no volvería a pintar nunca más.
   */
  const schedulePaint = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null
      paint()
    })
  }, [paint])

  const handleScroll = useCallback(() => {
    recenterBlock()
    schedulePaint()
  }, [recenterBlock, schedulePaint])

  /** Deja la ficha pedida en el centro, eligiendo la copia que ya está más cerca. */
  const centerStation = useCallback(
    (stationId: number) => {
      const list = listRef.current
      if (list === null) return

      const center = list.scrollTop + list.clientHeight / 2
      let target: number | null = null

      for (let copy = 0; copy < COPIES; copy += 1) {
        const element = itemsRef.current.get(itemKey(copy, stationId))
        if (element === undefined) continue

        const itemCenter = element.offsetTop + element.offsetHeight / 2
        if (target === null || Math.abs(itemCenter - center) < Math.abs(target - center)) {
          target = itemCenter
        }
      }

      if (target === null) return

      smoothScrollRef.current = true
      if (smoothTimerRef.current !== null) clearTimeout(smoothTimerRef.current)
      smoothTimerRef.current = setTimeout(() => {
        smoothScrollRef.current = false
        recenterBlock()
      }, SMOOTH_SCROLL_MS)

      list.scrollTo({ top: target - list.clientHeight / 2, behavior: 'smooth' })
    },
    [recenterBlock],
  )

  /**
   * Vuelve a medir tras cada cambio que altere el alto del contenido —otra búsqueda, otra
   * estación desplegada— y deja el scroll en la copia del medio, que es la única posición desde
   * la que se puede correr en los dos sentidos sin tocar un borde.
   *
   * useLayoutEffect y no useEffect: corre antes de que el navegador pinte, así el salto inicial
   * a la copia del medio no se ve como un tirón.
   */
  useLayoutEffect(() => {
    const list = listRef.current
    if (list === null) return

    evaluateLooping()

    if (firstStationId !== null) {
      const middle = itemsRef.current.get(itemKey(1, firstStationId))
      if (middle !== undefined) {
        list.scrollTop = middle.offsetTop + middle.offsetHeight / 2 - list.clientHeight / 2
      }
    }

    paint()

    // El alto de la columna cambia al redimensionar la ventana, y con él tanto el centro como
    // la respuesta a si un bloque entra o no.
    const observer = new ResizeObserver(() => {
      evaluateLooping()
      schedulePaint()
    })
    observer.observe(list)

    return () => {
      observer.disconnect()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      if (smoothTimerRef.current !== null) clearTimeout(smoothTimerRef.current)
    }
  }, [evaluateLooping, firstStationId, looping, paint, schedulePaint, stations.length])

  /**
   * Al elegir una estación —desde acá o desde un pin del mapa— el carrusel la trae al centro.
   *
   * Corre después de pintar, así que la ficha ya está desplegada con sus conectores y el
   * centrado usa el alto nuevo. Si corriera antes, quedaría centrada la ficha plegada y al
   * crecer se saldría de lugar.
   */
  useEffect(() => {
    if (selectedStationId === null) return
    centerStation(selectedStationId)
  }, [centerStation, selectedStationId])

  const copies = looping ? Array.from({ length: COPIES }, (_, copy) => copy) : [0]

  /**
   * Cuál de las copias es la "de verdad" para quien usa lector de pantalla y para el tabulador.
   *
   * Repitiendo es la del medio; sin repetir, la única que hay. Anunciar las tres sería leer la
   * misma lista de estaciones tres veces seguidas.
   */
  const realCopy = looping ? 1 : 0

  return (
    <>
      {/*
        El degradado es decorativo y NO debe recibir eventos: cubre buena parte del mapa, y sin
        pointer-events-none no se podría arrastrar el mapa por debajo.

        Los z-index altos no son un número al azar. Leaflet le pone z-index a sus propios panes
        —200 los mosaicos, 600 los marcadores, hasta 1000 los controles— y el contenedor del
        mapa no crea contexto de apilamiento, así que esos panes compiten directamente con esta
        capa. Con z-index automático, el carrusel queda DEBAJO de los mosaicos aunque venga
        después en el DOM: se ve mientras los mosaicos no cargaron y desaparece cuando cargan.

        En celular no va ninguna de las dos capas. Una columna de 320px sobre una pantalla de
        390 no deja mapa: taparía justo lo que se vino a mirar. Ahí el patrón es el panel que
        sube desde abajo, que todavía no está.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-[1100] hidden w-[45%] bg-gradient-to-l from-black via-black/75 to-transparent md:block"
      />

      <div
        ref={listRef}
        onScroll={handleScroll}
        className={`station-carousel absolute inset-y-0 right-0 z-[1110] hidden w-80 flex-col gap-3 overflow-y-auto px-4 md:flex ${
          looping ? '' : 'justify-center'
        }`}
      >
        {stations.length === 0 && (
          <p className="border-border bg-background/95 text-text-muted my-auto rounded-xl border p-4 text-sm">
            Ninguna estación coincide con la búsqueda.
          </p>
        )}

        {copies.map((copy) =>
          stations.map((station) => (
            <button
              key={itemKey(copy, station.stationId)}
              type="button"
              // Las copias son el mismo contenido repetido: para quien navega con lector de
              // pantalla, anunciarlo tres veces sería ruido. Solo la del medio es real.
              aria-hidden={copy === realCopy ? undefined : true}
              tabIndex={copy === realCopy ? undefined : -1}
              ref={(element) => {
                const key = itemKey(copy, station.stationId)
                if (element === null) itemsRef.current.delete(key)
                else itemsRef.current.set(key, element)
              }}
              onClick={() => onSelect(station.stationId)}
              // La escala crece hacia la izquierda: el borde derecho queda fijo contra la
              // columna y las fichas lejanas se leen como más angostas, no como corridas.
              className="origin-right shrink-0 text-left transition-transform duration-150"
            >
              <StationCard station={station} expanded={station.stationId === selectedStationId} />
            </button>
          )),
        )}
      </div>
    </>
  )
}
