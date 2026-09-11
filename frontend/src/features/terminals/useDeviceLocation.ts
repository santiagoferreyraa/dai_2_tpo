/**
 * Ubicación del dispositivo, tomada del navegador.
 *
 * Es la primera vez que la aplicación pide un permiso del navegador, así que conviene tener
 * claro qué se está pidiendo: `watchPosition` y no `getCurrentPosition`. La diferencia es que
 * el primero sigue avisando mientras el usuario se mueve, y acá el punto azul tiene que quedar
 * donde está el usuario y no donde estaba cuando abrió el mapa. El costo es que hay que
 * acordarse de cortar la suscripción al desmontar, o el navegador sigue midiendo con la
 * pantalla cerrada y se come la batería.
 *
 * **Exige contexto seguro.** La Geolocation API no existe fuera de HTTPS ni de localhost, así
 * que `pnpm dev` anda pero un despliegue sin TLS no. No es algo que se pueda sortear desde acá:
 * lo único razonable es detectarlo y decir "no disponible" en vez de dejar la promesa colgada.
 *
 * **La precisión importa tanto como la posición.** En el celular es GPS y cae en la vereda; en
 * una computadora de escritorio sale de la red y puede errarle por kilómetros. Por eso el hook
 * devuelve `accuracyM` y el mapa dibuja el círculo: un punto solo es una afirmación que el dato
 * no siempre banca, y el círculo es lo que la vuelve honesta.
 */

import { useEffect, useState } from 'react'

import { ARGENTINA_BOUNDS } from './mapConfig'

/**
 * Por qué no hay ubicación, cuando no la hay.
 *
 * Los cuatro casos se distinguen porque no se arreglan igual: `denied` lo revierte el usuario
 * desde el candado del navegador, `unavailable` no lo revierte nadie, y `out-of-bounds` es un
 * dato correcto que a esta pantalla no le sirve. Hoy ninguno se muestra —ver el comentario de
 * `StationsMapPage`—, pero el que quiera escribir ese cartel necesita esta distinción.
 */
export type DeviceLocationStatus =
  | 'locating'
  | 'ready'
  /** El usuario rechazó el permiso, o el navegador lo tiene bloqueado para el sitio. */
  | 'denied'
  /** Sin API, sin HTTPS, o el dispositivo no pudo ubicarse. */
  | 'unavailable'
  /** Ubicación válida pero fuera del recuadro del mapa. Ver abajo. */
  | 'out-of-bounds'

export interface DeviceLocation {
  latitude: number
  longitude: number
  /** Radio en metros dentro del cual está el usuario, con 95% de confianza. Lo define la API. */
  accuracyM: number
}

export interface DeviceLocationState {
  status: DeviceLocationStatus
  /** Solo con `status === 'ready'`. En cualquier otro caso es null. */
  location: DeviceLocation | null
}

/**
 * `enableHighAccuracy` prende el GPS en el celular. Cuesta batería y tarda más en el primer
 * arreglo, y se acepta las dos cosas: el mapa es para decidir a qué estación ir, y una posición
 * con 2 km de error no ordena las estaciones cercanas de la misma manera que una con 10 m.
 *
 * `maximumAge` acepta una posición cacheada de hasta medio minuto. Es lo que evita esperar un
 * arreglo nuevo al entrar al mapa viniendo de otra pantalla.
 */
const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 30_000,
}

function isSupported(): boolean {
  return typeof window !== 'undefined' && window.isSecureContext && 'geolocation' in navigator
}

/**
 * Nombre del parámetro que fuerza una ubicación durante el desarrollo.
 *
 * `?dev-loc=-34.61693,-58.38195` planta el punto ahí, y con un tercer valor se le da también la
 * precisión en metros: `?dev-loc=-34.61693,-58.38195,3000`.
 */
const DEV_LOCATION_PARAM = 'dev-loc'

/** Precisión que se asume si el parámetro no la trae. Chica: el caso "GPS de celular". */
const DEV_DEFAULT_ACCURACY_M = 40

/**
 * La ubicación forzada por la dirección, si estamos en desarrollo y viene bien escrita.
 *
 * **Existe porque probar esto de otra manera es un suplicio.** La alternativa es pisar
 * `navigator.geolocation` desde la consola, y eso se pierde en cada recarga, obliga a remontar
 * el componente a mano y encima Firefox bloquea el primer pegado en la consola pidiendo que uno
 * escriba `allow pasting`. Con el parámetro, la ubicación de prueba sobrevive las recargas, se
 * comparte como link y se cambia editando la barra de direcciones.
 *
 * **No llega a producción.** `import.meta.env.DEV` es una constante que Vite reemplaza al
 * compilar, así que en el build todo este cuerpo queda como código muerto y el empaquetador lo
 * borra: no es una bandera que alguien pueda encender en el navegador.
 *
 * NO se valida contra ARGENTINA_BOUNDS acá a propósito. El recorte del recuadro lo aplica el
 * hook igual, más abajo, sobre venga de donde venga la posición: si esto filtrara primero, el
 * parámetro no serviría justamente para reproducir el caso `out-of-bounds`.
 */
function readDevLocation(): DeviceLocation | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null

  const raw = new URLSearchParams(window.location.search).get(DEV_LOCATION_PARAM)
  if (raw === null) return null

  const [latitude, longitude, accuracyM] = raw.split(',').map(Number)

  /*
   * Coordenadas fuera de rango o sin número se ignoran en vez de plantar un punto en el medio
   * del Atlántico: un dedazo en la dirección tiene que devolver el comportamiento normal, no una
   * ubicación falsa que después cueste explicar.
   */
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null

  return {
    latitude,
    longitude,
    accuracyM: Number.isFinite(accuracyM) && accuracyM > 0 ? accuracyM : DEV_DEFAULT_ACCURACY_M,
  }
}

/**
 * Una posición cualquiera, convertida al estado del hook.
 *
 * Acá vive el recorte del recuadro, y está escrito UNA vez para que valga tanto para lo que
 * dice el navegador como para lo que fuerza `?dev-loc`: una regla que solo cumple uno de los
 * dos caminos deja de ser una regla y pasa a ser una diferencia entre desarrollo y producción.
 *
 * El descarte no es un capricho: el mapa está atado a ARGENTINA_BOUNDS con viscosidad 1 (ver
 * StationMap), así que un punto en Madrid no se puede centrar ni encuadrar. Dibujarlo igual
 * dejaría un pin inalcanzable y, peor, un encuadre de la línea que Leaflet recorta contra el
 * límite y termina mostrando cualquier cosa. Se prefiere no tener ubicación a tener una que
 * rompe el encuadre.
 */
function toState(location: DeviceLocation): DeviceLocationState {
  if (!ARGENTINA_BOUNDS.contains([location.latitude, location.longitude])) {
    return { status: 'out-of-bounds', location: null }
  }

  return { status: 'ready', location }
}

export function useDeviceLocation(): DeviceLocationState {
  /*
   * Arranca en 'unavailable' y no en 'locating' cuando ya se sabe que no se puede: el estado
   * inicial es lo que se dibuja en el primer cuadro, y prometer que está buscando algo que
   * nunca va a llegar es peor que decir que no hay.
   */
  const [state, setState] = useState<DeviceLocationState>(() => {
    const forced = readDevLocation()
    if (forced !== null) return toState(forced)

    return { status: isSupported() ? 'locating' : 'unavailable', location: null }
  })

  useEffect(() => {
    /*
     * Con la ubicación forzada no se suscribe nada: el permiso ni se pide, y sobre todo el
     * primer arreglo del GPS no llega después a pisar el punto de prueba, que es exactamente
     * el problema que este parámetro existe para evitar.
     *
     * Se vuelve a leer en vez de compartir el valor con el inicializador de arriba: dejarlo en
     * una variable del render lo metería en las dependencias del efecto, y un objeto nuevo por
     * render volvería a suscribir el `watchPosition` cada vez. Leer dos veces un parámetro de la
     * dirección no cuesta nada.
     */
    if (readDevLocation() !== null) return
    if (!isSupported()) return

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setState(toState({ latitude, longitude, accuracyM: accuracy }))
      },
      (error) => {
        setState({
          status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
          location: null,
        })
      },
      WATCH_OPTIONS,
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return state
}
