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

export interface VehicleSpec {
  label: string
  value: string
}

export interface Vehicle {
  name: string
  brand: string
  /** Los datos que van en la barra de vidrio, debajo del auto. */
  specs: VehicleSpec[]
}

export const DRIVER_VEHICLE: Vehicle = {
  name: 'Modelo 7',
  brand: 'Eléctrico · SUV',
  specs: [
    { label: 'Motor', value: '150 kW' },
    { label: 'Conector', value: 'CCS2' },
    { label: 'Carga máx.', value: '80 kW' },
    { label: 'Batería', value: '60 kWh' },
  ],
}

/** Dónde vive cada imagen. Si el archivo no está, el recuadro se dibuja igual, sin auto. */
export const VEHICLE_IMAGE = '/car.png'
export const GUEST_IMAGE = '/car-guest.png'
