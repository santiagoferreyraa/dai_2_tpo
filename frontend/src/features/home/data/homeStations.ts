/**
 * Las estaciones que necesita la portada, cargadas UNA vez.
 *
 * Tres recuadros de la portada hablan de estaciones —la más cercana, la compatibilidad y el
 * carrusel— y los tres salen de esta única llamada. Que sea una sola importa por lo que trae
 * cada endpoint: `GET /api/search` da la distancia pero no las fotos, y `GET /api/stations` da
 * las fotos pero no la distancia. `listStations` ya combina las dos llamadas para devolver la
 * estación completa (ver `stationsRepository`), así que alcanza con pedirle a él y calcular la
 * distancia acá.
 *
 * **La distancia se calcula en el front y no se le pide al backend**, y el motivo está explicado
 * en `terminals/geo.ts`: la posición del usuario cambia con cada arreglo del GPS, y consultar
 * de nuevo en cada uno sería un pedido de red por movimiento para reordenar quince filas que ya
 * están en memoria.
 */

import { useEffect, useMemo, useState } from 'react'

import { listStations } from '@/features/terminals/data/stationsRepository'
import { distanceKm } from '@/features/terminals/geo'
import type { StationDetail } from '@/features/terminals/types'
import { useDeviceLocation } from '@/features/terminals/useDeviceLocation'
import type { DeviceLocation } from '@/features/terminals/useDeviceLocation'

import { DRIVER_VEHICLE } from '../vehicle'

/**
 * Desde dónde se mide mientras el navegador no diga dónde está el usuario: UADE, Lima e
 * Independencia.
 *
 * **Es un punto de partida, no una mentira.** La portada no dice "estás en UADE": dice cuál es
 * la estación más cercana, y sin ubicación esa respuesta necesita algún origen o no hay
 * respuesta. El Obelisco —que es lo que usa el mapa— servía para centrar la vista, pero acá el
 * número que sale es una distancia concreta, así que conviene que el punto sea el lugar real
 * desde donde se está probando.
 *
 * Cuando el navegador contesta, este valor deja de usarse en el mismo cuadro.
 */
export const FALLBACK_ORIGIN = { latitude: -34.61693, longitude: -58.38195 }

/** Una estación con su distancia al usuario ya resuelta. */
export interface StationWithDistance {
  station: StationDetail
  distanceKm: number
}

export interface HomeStations {
  /** Todas las estaciones activas, en el orden que las devolvió el backend. */
  stations: StationDetail[]
  /**
   * La más cercana que le sirve al conductor: con un conector de SU tipo y libre ahora.
   *
   * Null si ninguna cumple las dos condiciones. No se cae a "la más cercana a secas" a
   * propósito: el recuadro promete una estación donde se puede enchufar, y ofrecer uno ocupado
   * o de otro conector sería contestar otra pregunta.
   */
  nearest: StationWithDistance | null
  /** Cuántas estaciones tienen al menos un conector del tipo que usa el auto. */
  compatibleCount: number
  /**
   * Cuántas de esas tienen además uno LIBRE ahora mismo.
   *
   * Es un subconjunto de `compatibleCount` y se cuenta aparte porque contestan preguntas
   * distintas: una dice a cuántas podrías ir alguna vez, la otra a cuántas podrías ir ahora.
   * La segunda es la que sirve para salir a cargar; la primera, para saber si el auto encaja
   * en la red.
   */
  usableCount: number
  /** Desde dónde se midió. Es la del dispositivo, o FALLBACK_ORIGIN. */
  origin: DeviceLocation | typeof FALLBACK_ORIGIN
  /**
   * La ubicación del dispositivo, o null si el navegador no la dio.
   *
   * Va aparte de `origin` porque son dos cosas distintas: `origin` siempre tiene un valor
   * —contra él se mide— y esta dice si ese valor es real. El mini mapa la necesita así: dibuja
   * el punto azul solo cuando hay ubicación de verdad, y con el punto de reserva no debe
   * dibujar nada.
   */
  deviceLocation: DeviceLocation | null
  /** Si se está midiendo desde el punto de reserva y no desde el dispositivo. */
  usingFallback: boolean
  loading: boolean
  error: string | null
}

export function useHomeStations(): HomeStations {
  const [stations, setStations] = useState<StationDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const device = useDeviceLocation()

  useEffect(() => {
    /*
     * Si la portada se desmonta antes de que el backend conteste, la petición se cancela. Ese
     * rechazo NO es un error para mostrar: nadie está esperando la respuesta. Mismo criterio
     * que usa StationsMapPage.
     */
    const controller = new AbortController()

    listStations(controller.signal)
      .then(setStations)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las estaciones')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [])

  const origin = device.location ?? FALLBACK_ORIGIN

  /*
   * Las dos cuentas van juntas en un `useMemo` porque recorren la misma lista y dependen de lo
   * mismo. Sin memo se rehacen en cada arreglo del GPS —que son muchos—, y aunque quince
   * estaciones no cuesten nada, el resultado cambiaría de identidad en cada render y arrastraría
   * a los componentes de abajo a redibujarse por nada.
   */
  const { nearest, compatibleCount, usableCount } = useMemo(() => {
    const compatible = stations.filter((station) =>
      station.connectors.some((c) => c.connectorType === DRIVER_VEHICLE.connectorType),
    )

    const usable = compatible.filter((station) =>
      station.connectors.some(
        (c) =>
          c.connectorType === DRIVER_VEHICLE.connectorType && c.operationalStatus === 'AVAILABLE',
      ),
    )

    const closest = usable.reduce<StationWithDistance | null>((best, station) => {
      const km = distanceKm(origin, station)
      return best === null || km < best.distanceKm ? { station, distanceKm: km } : best
    }, null)

    return {
      nearest: closest,
      compatibleCount: compatible.length,
      usableCount: usable.length,
    }
  }, [stations, origin])

  return {
    stations,
    nearest,
    compatibleCount,
    usableCount,
    origin,
    deviceLocation: device.location,
    usingFallback: device.location === null,
    loading,
    error,
  }
}
