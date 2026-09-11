/**
 * El vehículo del conductor.
 *
 * **Está escrito a mano y es provisorio.** El sistema todavía no tiene concepto de vehículo:
 * `Requerimientos.md` no lo nombra, así que no hay entidad, ni endpoint, ni pantalla para
 * elegirlo. Cuando exista —el conductor elige su auto y la ficha sale de un catálogo—, este
 * archivo se borra y lo que hoy es una constante pasa a ser un dato del perfil.
 *
 * **Todo lo que hay acá es ficha técnica, no medición.** La distinción importa y es la que
 * separa lo que se puede mostrar de lo que no: la potencia del motor y el tipo de conector son
 * datos de catálogo del modelo, ciertos siempre; la carga actual de la batería o la autonomía
 * que queda son lecturas del auto, y esta aplicación no habla con el auto. Por eso la referencia
 * de diseño muestra un 92% de batería y esta pantalla no.
 *
 * El nombre, la marca y los números son un ejemplo, y están pensados para editarse: cambialos
 * para que acompañen a la imagen que haya en `public/car.png`.
 */

import type { ConnectorType } from '@/features/terminals/types'

/**
 * Cuál de los cuatro dibujos acompaña al dato.
 *
 * Va como NOMBRE y no como componente porque este archivo es de datos y no dibuja nada: metiendo
 * un componente acá habría que convertirlo en `.tsx` y pasaría a depender de la biblioteca de
 * íconos. Quien lo muestra traduce el nombre.
 */
export type SpecIcon = 'motor' | 'connector' | 'power' | 'battery'

export interface VehicleSpec {
  label: string
  value: string
  icon: SpecIcon
}

/**
 * **Los números van tipados y la ficha se DERIVA de ellos, no al lado.**
 *
 * Antes `specs` era la única fuente y guardaba `'60 kWh'` como texto. Alcanzaba mientras nadie
 * hiciera cuentas, pero la portada ahora sí las hace: compara el conector del auto con el de
 * cada estación y estima cuánto tarda una carga. Un texto con la unidad pegada obliga a
 * parsearlo, y parsear un dato que uno mismo escribió es la forma más tonta de perderlo.
 *
 * Escrito así hay UN solo lugar donde vive cada número, y la ficha que se muestra sale de él.
 */
export interface Vehicle {
  name: string
  brand: string
  /** Potencia del motor, en kW. Es dato de catálogo: no dice nada de la carga. */
  motorKw: number
  /** El conector que acepta. Tipado porque la portada lo compara contra los de las estaciones. */
  connectorType: ConnectorType
  /**
   * Lo máximo que el auto acepta al cargar, en kW.
   *
   * NO es lo mismo que la potencia del cargador, y esa diferencia es justo lo que hace útil el
   * dato: en una estación de 150 kW este auto igual carga a 80, así que el surtidor más rápido
   * no siempre le sirve de más.
   */
  maxChargeKw: number
  /** Capacidad de la batería, en kWh. */
  batteryKWh: number
}

export const DRIVER_VEHICLE: Vehicle = {
  name: 'Modelo 7',
  /*
   * La MARCA, no la categoría. Antes decía "Eléctrico · SUV", que describía el auto pero no lo
   * identificaba: debajo del nombre del modelo, el renglón chico es donde uno espera leer de
   * quién es.
   *
   * Inventada a propósito. El dibujo de `public/car.png` no es de ninguna marca real, así que
   * ponerle una existente le atribuiría el modelo a una empresa que no lo hizo. Cambiala junto
   * con la imagen.
   */
  brand: 'Voltera',
  motorKw: 150,
  connectorType: 'CCS2',
  maxChargeKw: 80,
  batteryKWh: 60,
}

/** Cómo se lee cada tipo de conector. Repetido de Terminales para no importar toda su tabla. */
const CONNECTOR_NAME: Record<ConnectorType, string> = {
  CCS2: 'CCS2',
  CHADEMO: 'CHAdeMO',
  TYPE_2: 'Tipo 2',
}

/**
 * La ficha que se muestra en la barra de vidrio, debajo del auto.
 *
 * Se arma a partir del vehículo en vez de escribirse aparte: así no hay forma de que el número
 * de la ficha y el que usa la cuenta se separen con el tiempo.
 */
export function specsOf(vehicle: Vehicle): VehicleSpec[] {
  return [
    { label: 'Motor', value: `${String(vehicle.motorKw)} kW`, icon: 'motor' },
    { label: 'Conector', value: CONNECTOR_NAME[vehicle.connectorType], icon: 'connector' },
    { label: 'Carga máx.', value: `${String(vehicle.maxChargeKw)} kW`, icon: 'power' },
    { label: 'Batería', value: `${String(vehicle.batteryKWh)} kWh`, icon: 'battery' },
  ]
}

/**
 * Dónde vive la imagen del auto. Si el archivo no está, el recuadro se dibuja igual, sin auto.
 *
 * Es una sola para todos. Hubo un `/car-guest.png` aparte para la portada sin sesión, pero era
 * el mismo dibujo byte por byte: dos nombres para un archivo solo agregan una copia que se puede
 * desincronizar.
 */
export const VEHICLE_IMAGE = '/car.png'
