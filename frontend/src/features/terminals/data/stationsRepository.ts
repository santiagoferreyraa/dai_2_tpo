import type { Connector, StationDetail, StationInput } from '../types'

/**
 * Acceso a datos de estaciones.
 *
 * Hoy responde con datos en memoria porque el backend todavía no expone lectura: no hay
 * `GET /api/estaciones` ni `GET /api/estaciones/{id}`, y `StationResponse` no incluye los
 * conectores. Escribir la pantalla contra la API real la dejaría en 404 hasta que aparezcan.
 *
 * La pantalla nunca llama a `fetch` ni a `api` directamente: llama a estas funciones. Cuando
 * los endpoints existan se reescribe SOLO este archivo —el cuerpo de cada función pasa a ser
 * la llamada al cliente HTTP, comentada abajo en cada una— y ningún componente se entera.
 *
 * Todas devuelven `Promise` aun siendo síncronas por dentro, justamente para que ese cambio
 * no obligue a tocar los componentes.
 */

/** Latencia simulada, para que los estados de carga de la UI sean visibles en desarrollo. */
const FAKE_LATENCY_MS = 250

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), FAKE_LATENCY_MS))
}

/** Contador de ids del almacén en memoria. Lo reemplaza el identity de Postgres. */
let nextId = 1

function takeId(): number {
  return nextId++
}

/**
 * Fotos de ejemplo. Son URLs remotas porque es lo que el backend guarda hoy
 * (`station_photos.url`, VARCHAR 500); las que carga el usuario desde el celular son
 * object URLs locales. Ver ImagePicker.
 */
const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800',
  'https://images.unsplash.com/photo-1633113093730-47449a1a9c6e?w=800',
  'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800',
]

function seed(): StationDetail[] {
  const rows: Array<
    [
      string,
      string,
      number,
      number,
      Array<[Connector['connectorType'], number, Connector['operationalStatus']]>,
    ]
  > = [
    [
      'YPF San Juan',
      'Av. San Juan 2901, C1235 Cdad. Autónoma de Buenos Aires',
      -34.62294,
      -58.39073,
      [
        ['CCS2', 8.2, 'AVAILABLE'],
        ['TYPE_2', 22, 'AVAILABLE'],
        ['CHADEMO', 50, 'OUT_OF_SERVICE'],
      ],
    ],
    [
      'Shell Recoleta',
      'Av. Callao 1234, C1023 Cdad. Autónoma de Buenos Aires',
      -34.59539,
      -58.39325,
      [
        ['CCS2', 150, 'OCCUPIED'],
        ['TYPE_2', 11, 'OCCUPIED'],
      ],
    ],
    [
      'Axion Palermo',
      'Av. Santa Fe 3253, C1425 Cdad. Autónoma de Buenos Aires',
      -34.58817,
      -58.41072,
      [['CHADEMO', 50, 'OUT_OF_SERVICE']],
    ],
    [
      'Puma Belgrano',
      'Av. Cabildo 2100, C1428 Cdad. Autónoma de Buenos Aires',
      -34.5615,
      -58.45633,
      [
        ['CCS2', 60, 'OCCUPIED'],
        ['TYPE_2', 7.4, 'AVAILABLE'],
      ],
    ],
    [
      'YPF Puerto Madero',
      'Av. Alicia Moreau de Justo 1150, C1107 Cdad. Autónoma de Buenos Aires',
      -34.61128,
      -58.36416,
      [
        ['CCS2', 8.2, 'AVAILABLE'],
        ['CHADEMO', 25, 'AVAILABLE'],
      ],
    ],
  ]

  return rows.map(([name, address, latitude, longitude, connectors]) => ({
    id: takeId(),
    name,
    address,
    latitude,
    longitude,
    // Operador dueño: el backend lo fija en 1 hasta que exista la tabla de usuarios (ECO-23).
    ownerId: 1,
    active: true,
    photoUrls: [...SAMPLE_PHOTOS],
    connectors: connectors.map(([connectorType, maxPowerKw, operationalStatus]) => ({
      id: takeId(),
      connectorType,
      maxPowerKw,
      operationalStatus,
    })),
  }))
}

/** Almacén en memoria. Se pierde al recargar la página; es la gracia de que sea temporal. */
let stations: StationDetail[] = seed()

/** Copia defensiva: que la pantalla mute lo que devolvemos no debe cambiar el almacén. */
function clone(station: StationDetail): StationDetail {
  return {
    ...station,
    photoUrls: [...station.photoUrls],
    connectors: station.connectors.map((connector) => ({ ...connector })),
  }
}

function applyInput(station: StationDetail, input: StationInput): StationDetail {
  return {
    ...station,
    name: input.name.trim(),
    address: input.address.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
    photoUrls: [...input.photoUrls],
    connectors: input.connectors.map((draft) => ({
      id: draft.id ?? takeId(),
      connectorType: draft.connectorType,
      maxPowerKw: draft.maxPowerKw,
      operationalStatus: draft.operationalStatus,
    })),
  }
}

/**
 * Estaciones dadas de alta, sin las dadas de baja.
 *
 * Contra la API: `api.get<StationResponse[]>('/estaciones')`, más los conectores de cada
 * una cuando el backend los devuelva.
 */
export function listStations(): Promise<StationDetail[]> {
  return delay(stations.filter((station) => station.active).map(clone))
}

/**
 * Alta de una estación con sus conectores.
 *
 * Contra la API son varias llamadas, no una: `api.post('/estaciones', …)` y después un
 * `api.post('/conectores/{stationId}/configurar', …)` por conector —ese endpoint crea uno
 * nuevo cuando el id que recibe es el de una estación— más un
 * `api.patch('/conectores/{id}/estado', …)` para los que no queden en AVAILABLE, que es
 * el estado con el que nacen.
 */
export function createStation(input: StationInput): Promise<StationDetail> {
  const created = applyInput(
    {
      id: takeId(),
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      ownerId: 1,
      active: true,
      photoUrls: [],
      connectors: [],
    },
    input,
  )

  stations = [created, ...stations]
  return delay(clone(created))
}

/**
 * Edición de una estación existente.
 *
 * Contra la API: `api.put('/estaciones/{id}', …)` para los datos de la estación, y por cada
 * conector `api.post('/conectores/{id}/configurar', …)` (tipo y potencia) más
 * `api.patch('/conectores/{id}/estado', …)` (estado operativo), que son endpoints distintos.
 *
 * Ojo con los conectores eliminados en el formulario: el backend todavía no expone un
 * borrado de conectores, así que hoy la eliminación solo vive acá.
 */
export function updateStation(id: number, input: StationInput): Promise<StationDetail> {
  const current = stations.find((station) => station.id === id)
  if (!current) return Promise.reject(new Error(`Estación no encontrada con ID: ${id}`))

  const updated = applyInput(current, input)
  stations = stations.map((station) => (station.id === id ? updated : station))
  return delay(clone(updated))
}

/**
 * Baja lógica, no borrado: la estación puede tener reservas y sesiones colgando.
 *
 * Contra la API: `api.delete('/estaciones/{id}')`, que hace exactamente esto.
 */
export function deactivateStation(id: number): Promise<void> {
  stations = stations.map((station) =>
    station.id === id ? { ...station, active: false } : station,
  )
  return delay(undefined)
}
