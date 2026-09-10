/**
 * Mapa de estaciones de carga (RF07).
 *
 * En esta etapa dibuja las estaciones que recibe por props y avisa cuál se eligió. La búsqueda
 * por viewport —traducir el recuadro visible a centro y radio, con debounce— entra después.
 */

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'

import { useTheme } from '@/features/theme/theme'

import {
  ARGENTINA_BOUNDS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  FOCUS_ZOOM,
  MAX_NATIVE_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  TILES,
} from '../mapConfig'
import StationHoverCard from './StationHoverCard'
import { DEVICE_PIN } from '../devicePin'
import { stationPin } from '../stationPin'
import type { DeviceLocation } from '../useDeviceLocation'
import type { StationResult } from '../types'

/**
 * Cuánto hay que sostener el mouse sobre un pin antes de que aparezca la tarjeta.
 *
 * La espera es el punto: sin ella, cruzar el mapa con el mouse abre y cierra media docena de
 * tarjetas al pasar. Con la demora solo aparece la de la estación en la que uno se detuvo.
 */
const HOVER_DELAY_MS = 800

/**
 * Le avisa a Leaflet cuando cambia el tamaño del contenedor.
 *
 * Leaflet mide el contenedor UNA vez, al crearse, y con esa medida decide qué mosaicos pedir.
 * Acá el contenedor todavía no tiene su tamaño final en ese momento —lo define el flex, después
 * del primer pintado—, así que el mapa queda convencido de ser mucho más chico de lo que es:
 * se ve un cuadrado de mapa en el medio y gris alrededor, con los pins cayendo afuera.
 *
 * Un ResizeObserver y no un useEffect a secas porque el problema se repite en cada cambio de
 * tamaño: al redimensionar la ventana, y sobre todo al abrir y cerrar el panel lateral.
 */
function InvalidateSizeOnResize() {
  const map = useMap()

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  return null
}

/**
 * Acerca el mapa a la estación elegida.
 *
 * flyTo y no setView: el desplazamiento animado deja ver hacia dónde se movió el mapa. Con un
 * salto seco, quien viene de elegir una ficha en el carrusel pierde la referencia de dónde
 * estaba parado.
 *
 * Recibe la estación entera y no su id para que el efecto dependa del objeto: `find` sobre el
 * arreglo devuelve siempre la misma referencia mientras no cambie la selección, así que un
 * repintado cualquiera no vuelve a mover el mapa.
 *
 * `bottomInsetPx` es el alto que le tapa el panel al mapa. Sin compensarlo, en celular el pin
 * queda centrado en la ventana y por lo tanto DEBAJO del panel que se acaba de abrir: el mapa
 * se mueve hacia una estación que no se ve. Se corrige subiendo el centro la mitad de lo
 * tapado, que es lo que vuelve a dejar el pin en el medio del hueco visible.
 */
function FlyToStation({
  station,
  bottomInsetPx,
}: {
  station: StationResult | null
  bottomInsetPx: number
}) {
  const map = useMap()

  useEffect(() => {
    if (station === null) return

    const target = L.latLng(station.latitude, station.longitude)
    if (bottomInsetPx === 0) {
      map.flyTo(target, FOCUS_ZOOM)
      return
    }

    /*
     * La corrección se hace en píxeles y no en grados: cuántos grados son 150 px depende del
     * zoom y de la latitud, y al zoom de destino, que todavía no es el actual. `project` a ese
     * zoom convierte una vez y evita las dos cuentas.
     */
    const point = map.project(target, FOCUS_ZOOM).add([0, bottomInsetPx / 2])
    map.flyTo(map.unproject(point, FOCUS_ZOOM), FOCUS_ZOOM)
  }, [map, station, bottomInsetPx])

  return null
}

/**
 * Aleja el mapa hasta que entren el dispositivo y la estación.
 *
 * Es el gesto de la reserva: la pregunta que contesta no es "dónde está la estación" —eso ya lo
 * contestó FlyToStation al elegirla— sino "qué tan lejos me queda". Esa pregunta necesita las
 * dos puntas en pantalla al mismo tiempo, y por eso acá se ALEJA donde el resto de la pantalla
 * acerca.
 *
 * `flyToBounds` y no `fitBounds`, por lo mismo que FlyToStation usa `flyTo`: el viaje animado
 * deja ver que el mapa se abrió hacia atrás. Un salto seco desde el zoom 15 hasta ver media
 * provincia es desorientador, y encima se comería el arranque de la línea.
 *
 * El relleno de abajo suma `bottomInsetPx` por el mismo motivo que allá: en celular el panel
 * está abierto justo cuando se toca Reservar, así que sin compensarlo el encuadre mete la
 * estación —o al usuario— detrás del panel. `paddingBottomRight` es la forma que tiene Leaflet
 * de pedir un margen asimétrico, que es exactamente el caso.
 *
 * **El origen se lee de un ref y no de las dependencias.** `watchPosition` avisa cada vez que
 * el usuario se mueve, así que `from` cambia de identidad seguido; si estuviera en las
 * dependencias, cada arreglo del GPS volvería a disparar el vuelo y el mapa quedaría
 * reencuadrándose solo durante los 2,5 segundos que dura la línea. El encuadre tiene que pasar
 * UNA vez, cuando aparece el destino.
 */
function FitTrace({
  from,
  to,
  bottomInsetPx,
}: {
  from: DeviceLocation | null
  to: StationResult | null
  bottomInsetPx: number
}) {
  const map = useMap()

  const fromRef = useRef(from)

  /*
   * El ref se sincroniza en un efecto y no durante el render —React pide no tocar `current`
   * mientras se renderiza—, y este efecto va declarado ANTES del de abajo a propósito: los
   * efectos corren en orden de declaración, así que cuando el de abajo lee el ref ya tiene la
   * posición de ESTE render y no la del anterior. Invertidos, el encuadre saldría de una
   * posición vieja por un arreglo del GPS.
   */
  useEffect(() => {
    fromRef.current = from
  }, [from])

  useEffect(() => {
    const origin = fromRef.current
    if (to === null || origin === null) return

    const bounds = L.latLngBounds([origin.latitude, origin.longitude], [to.latitude, to.longitude])

    map.flyToBounds(bounds, {
      paddingTopLeft: [56, 56],
      paddingBottomRight: [56, 56 + bottomInsetPx],
      /*
       * El techo evita el caso degenerado: con el usuario a media cuadra de la estación, el
       * recuadro es diminuto y Leaflet se acercaría hasta el máximo que dé el proveedor. La
       * reserva quedaría mostrando dos puntos separados por toda la pantalla, que es
       * justamente la lectura contraria a "esto te queda al lado".
       */
      maxZoom: FOCUS_ZOOM,
    })
  }, [map, to, bottomInsetPx])

  return null
}

interface StationMapProps {
  stations: StationResult[]
  selectedStationId: number | null
  onSelect: (stationId: number) => void
  /** Alto que el panel de detalle le tapa al mapa desde abajo. Ver FlyToStation. */
  bottomInsetPx?: number
  /** Apaga los pines que no son el elegido. Se usa con el panel abierto. */
  dimUnselected?: boolean
  /** Dónde está el dispositivo, si el navegador lo dijo. Ver useDeviceLocation. */
  deviceLocation?: DeviceLocation | null
  /**
   * Estación hacia la que se traza la línea desde el dispositivo, o null para no trazar nada.
   *
   * Quién la prende y por cuánto tiempo NO se decide acá: lo decide la pantalla, que es la que
   * sabe qué acción la disparó. Este componente solo dibuja lo que le pasan.
   */
  traceTo?: StationResult | null
}

export default function StationMap({
  stations,
  selectedStationId,
  onSelect,
  bottomInsetPx = 0,
  dimUnselected = false,
  deviceLocation = null,
  traceTo = null,
}: StationMapProps) {
  const theme = useTheme()
  const [hoveredStationId, setHoveredStationId] = useState<number | null>(null)
  const selectedStation = stations.find((s) => s.stationId === selectedStationId) ?? null
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearHoverTimer() {
    if (hoverTimer.current === null) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = null
  }

  function startHover(stationId: number) {
    clearHoverTimer()
    hoverTimer.current = setTimeout(() => setHoveredStationId(stationId), HOVER_DELAY_MS)
  }

  function cancelHover() {
    clearHoverTimer()
    setHoveredStationId(null)
  }

  // Si la pantalla se desmonta con el temporizador corriendo, el setState posterior cae sobre
  // un componente que ya no existe.
  useEffect(() => clearHoverTimer, [])

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={ARGENTINA_BOUNDS}
      // Sin esto el borde es elástico: se puede arrastrar afuera y el mapa vuelve solo.
      maxBoundsViscosity={1}
      // Sin botones de zoom: se acerca con la rueda, con pellizco y tocando una estación,
      // que son los tres gestos con los que se usa un mapa. Los botones ocupaban la esquina
      // de abajo a la izquierda, que es justo por donde sube el panel de detalle.
      zoomControl={false}
      // Tampoco va el cartel de atribución que Leaflet dibuja abajo a la derecha: en celular
      // se monta sobre el panel de detalle y en el resto queda debajo del carrusel.
      //
      // OJO: apagar el cartel NO exime de acreditar a Esri y a OpenStreetMap, que la licencia
      // de los mosaicos sigue exigiendo. El crédito tiene que estar visible en algún otro lugar
      // de la aplicación —un pie de página o una pantalla "acerca de"—, y el texto para ponerlo
      // es TILE_ATTRIBUTION, que sigue exportado en mapConfig justo para eso.
      attributionControl={false}
      // Absoluto contra el contenedor, y no h-full, por un motivo concreto: un height en
      // porcentaje se resuelve contra la altura ESPECIFICADA del padre, y la del padre la
      // calcula el flex (height: auto). El porcentaje queda sin referencia, Leaflet mide 0px
      // y no dibuja nada, sin un solo error en consola. inset-0 no depende de porcentajes.
      className="absolute inset-0"
    >
      <InvalidateSizeOnResize />
      <FlyToStation station={selectedStation} bottomInsetPx={bottomInsetPx} />
      <FitTrace from={deviceLocation} to={traceTo} bottomInsetPx={bottomInsetPx} />

      {/*
        Los mosaicos cambian con el tema, y son DOS juegos distintos del mismo proveedor: no es el
        mismo mapa con un filtro encima. Un filtro sobre mosaicos claros no da un mapa oscuro, da
        los mismos trazos apagados; el proveedor sí redibuja el mapa con tinta clara sobre fondo
        oscuro, que es otra cosa.

        `key` fuerza a rehacer la capa al cambiar de tema. Sin eso Leaflet cambia la dirección pero
        deja en pantalla los mosaicos viejos hasta que hace falta pedir uno nuevo, así que al
        cambiar de tema el mapa se queda con el color anterior hasta que alguien lo mueve.
      */}
      <TileLayer
        key={theme}
        url={theme === 'light' ? TILES.light : TILES.dark}
        maxNativeZoom={MAX_NATIVE_ZOOM}
        maxZoom={MAX_ZOOM}
      />

      {stations.map((station) => (
        <Marker
          key={station.stationId}
          position={[station.latitude, station.longitude]}
          icon={stationPin(
            station,
            station.stationId === selectedStationId,
            dimUnselected && station.stationId !== selectedStationId,
          )}
          eventHandlers={{
            mouseover: () => startHover(station.stationId),
            mouseout: cancelHover,
            click: () => onSelect(station.stationId),
          }}
        >
          {hoveredStationId === station.stationId && (
            // permanent porque el que decide cuándo se ve es el temporizador, no Leaflet.
            // opacity 1 porque los tooltips vienen al 0.9 y la tarjeta se vería lavada.
            // El offset negativo compensa el margen que Leaflet reserva para la flecha del
            // tooltip: la flecha está oculta, pero el espacio se sigue contando. Medido con la
            // tarjeta abierta, dejaba su círculo 8px a la derecha del pin, y el pin asomaba por
            // debajo en vez de quedar tapado.
            <Tooltip
              permanent
              direction="right"
              offset={[-8, 1]}
              opacity={1}
              className="station-tooltip"
            >
              <StationHoverCard station={station} />
            </Tooltip>
          )}
        </Marker>
      ))}

      {deviceLocation !== null && (
        <>
          {/*
            El punto y nada más: el círculo de precisión que había acá se sacó por decisión de
            producto.

            Vale saber qué se perdió, porque el dato sigue estando en `accuracyM`. El círculo era
            el margen de error que informa el navegador, y su función era impedir que un punto
            solo afirmara una exactitud que la medición no tiene: sin GPS la ubicación sale de la
            red y puede errarle un kilómetro. El costo era que en ese mismo caso —el peor— tapaba
            media pantalla, que es lo que lo volvía intolerable justo cuando más decía.

            Si alguna vez se quiere el aviso sin el manchón, la forma es dibujarlo solo cuando la
            precisión es MALA de verdad (por encima de unos 500 m): ahí el círculo es una
            advertencia y no un adorno permanente.

            `interactive={false}`: el marcador se dibuja encima de los pines de estación y sin
            esto se queda con los clics de cualquiera que le caiga debajo. La ubicación no es
            algo que se elija, así que no tiene por qué capturar el mouse.
          */}
          <Marker
            position={[deviceLocation.latitude, deviceLocation.longitude]}
            icon={DEVICE_PIN}
            interactive={false}
            /*
              Por encima de los pines de estación. Leaflet ordena los marcadores por latitud
              —el que está más al sur tapa al que está más al norte—, y con ese criterio la
              ubicación propia desaparece detrás de cualquier estación que le quede al sur.
            */
            zIndexOffset={1000}
          />

          {/*
            La línea recta hasta la estación reservada.

            Recta y NO un recorrido por calles: no hay grafo vial en el proyecto, así que esto
            dice dirección y distancia, no por dónde ir. Que sea punteada y titile es justamente
            lo que la despega de una ruta trazada —una línea llena y quieta se leería como el
            camino a hacer— y lo que la vuelve un gesto que pasa en vez de una capa del mapa.

            Se desmonta sola cuando la pantalla apaga `traceTo`; el desvanecido del final lo
            hace la animación de CSS, sincronizada con ese plazo. Ver `.station-trace`.
          */}
          {traceTo !== null && (
            <Polyline
              positions={[
                [deviceLocation.latitude, deviceLocation.longitude],
                [traceTo.latitude, traceTo.longitude],
              ]}
              interactive={false}
              pathOptions={{ className: 'station-trace' }}
            />
          )}
        </>
      )}
    </MapContainer>
  )
}
