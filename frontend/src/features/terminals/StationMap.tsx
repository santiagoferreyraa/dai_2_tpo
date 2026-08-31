/**
 * Mapa de estaciones de carga (RF07).
 *
 * En esta etapa dibuja las estaciones que recibe por props y avisa cuál se eligió. La búsqueda
 * por viewport —traducir el recuadro visible a centro y radio, con debounce— entra después.
 */

import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet'

import {
  ARGENTINA_BOUNDS,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  FOCUS_ZOOM,
  MAX_NATIVE_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  TILES,
  TILE_ATTRIBUTION,
} from './mapConfig'
import StationHoverCard from './StationHoverCard'
import { stationPin } from './stationPin'
import type { StationResult } from './types'

/**
 * Cuánto hay que sostener el mouse sobre un pin antes de que aparezca la tarjeta.
 *
 * La espera es el punto: sin ella, cruzar el mapa con el mouse abre y cierra media docena de
 * tarjetas al pasar. Con la demora solo aparece la de la estación en la que uno se detuvo.
 */
const HOVER_DELAY_MS = 1500

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
 */
function FlyToStation({ station }: { station: StationResult | null }) {
  const map = useMap()

  useEffect(() => {
    if (station === null) return
    map.flyTo([station.latitude, station.longitude], FOCUS_ZOOM)
  }, [map, station])

  return null
}

interface StationMapProps {
  stations: StationResult[]
  selectedStationId: number | null
  onSelect: (stationId: number) => void
}

export default function StationMap({ stations, selectedStationId, onSelect }: StationMapProps) {
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
      // El control propio de Leaflet se dibuja arriba a la izquierda, que es donde va el
      // buscador. Se apaga acá y se vuelve a poner abajo, con ZoomControl.
      zoomControl={false}
      // Absoluto contra el contenedor, y no h-full, por un motivo concreto: un height en
      // porcentaje se resuelve contra la altura ESPECIFICADA del padre, y la del padre la
      // calcula el flex (height: auto). El porcentaje queda sin referencia, Leaflet mide 0px
      // y no dibuja nada, sin un solo error en consola. inset-0 no depende de porcentajes.
      className="absolute inset-0"
    >
      <ZoomControl position="bottomleft" />

      <InvalidateSizeOnResize />
      <FlyToStation station={selectedStation} />

      <TileLayer
        url={TILES.dark}
        attribution={TILE_ATTRIBUTION}
        maxNativeZoom={MAX_NATIVE_ZOOM}
        maxZoom={MAX_ZOOM}
      />

      {stations.map((station) => (
        <Marker
          key={station.stationId}
          position={[station.latitude, station.longitude]}
          icon={stationPin(station, station.stationId === selectedStationId)}
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
    </MapContainer>
  )
}
