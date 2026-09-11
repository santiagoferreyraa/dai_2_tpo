/**
 * Un puñado de estaciones para mostrar en la portada del celular.
 *
 * **Son fijas y no salen del backend, a propósito.** La sección equivalente del diseño de
 * referencia dice "cerca tuyo", y eso hoy no lo podemos sostener: no pedimos permiso de
 * ubicación en ningún lado, así que no hay con qué medir la cercanía. Inventar distancias sería
 * la clase de número que después nadie puede explicar de dónde salió.
 *
 * Por eso la sección se llama "Para empezar" y no "Cerca tuyo", y estas cuatro son una muestra de
 * la red, no un resultado. El que quiere buscar de verdad tiene el buscador arriba y el mapa a un
 * toque.
 *
 * Los nombres y las direcciones son los mismos que trae el seed del backend, así que lo que se ve
 * acá existe en la aplicación. Cuando la portada pase a pedir datos —con ubicación o sin ella—
 * este archivo se borra y en su lugar va la llamada.
 */

export interface SampleStation {
  name: string
  address: string
  /** Potencia máxima de la estación, en kW. */
  powerKw: number
  /** Tipos de conector, tal como los nombra RF05. */
  connectors: string[]
}

export const SAMPLE_STATIONS: SampleStation[] = [
  {
    name: 'Recarga Obelisco',
    address: 'Av. 9 de Julio 1000, CABA',
    powerKw: 150,
    connectors: ['CCS2'],
  },
  {
    name: 'Punto Puerto Madero',
    address: 'Olga Cossettini 1200, CABA',
    powerKw: 180,
    connectors: ['CCS2'],
  },
  {
    name: 'Estación Palermo Soho',
    address: 'Jorge Luis Borges 1700, CABA',
    powerKw: 22,
    connectors: ['Tipo 2'],
  },
  {
    name: 'Recarga Recoleta',
    address: 'Av. Quintana 500, CABA',
    powerKw: 50,
    connectors: ['CCS2', 'CHAdeMO'],
  },
]
