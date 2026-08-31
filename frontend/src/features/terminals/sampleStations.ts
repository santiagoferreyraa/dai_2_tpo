/**
 * Estaciones de ejemplo para desarrollar el mapa sin backend levantado.
 *
 * Espejan fila por fila la migración `V202608302100__seed_stations.sql`: mismos ids, mismos
 * nombres, mismas coordenadas y los mismos conectores en el mismo orden. Es a propósito.
 * Cuando entre la búsqueda por viewport, cambiar esta constante por la llamada a
 * `searchStations` no debería mover un solo pin; si mueve alguno, es un bug de verdad y no
 * ruido de estar comparando dos conjuntos de datos distintos.
 *
 * `distanceKm` está calculada contra DEFAULT_CENTER —el Obelisco— porque es un dato de la
 * consulta y no de la estación: lo produce el backend en cada búsqueda.
 *
 * Este archivo se borra cuando la pantalla consulte la API de verdad.
 */

import type { StationResult } from './types'

export const SAMPLE_STATIONS: StationResult[] = [
  {
    stationId: 1,
    name: 'Recarga Obelisco',
    address: 'Av. 9 de Julio 1000, CABA',
    latitude: -34.6037,
    longitude: -58.3816,
    distanceKm: 0.0,
    matchingConnectors: [
      { connectorId: 1, connectorType: 'CCS2', maxPowerKw: 150, operationalStatus: 'AVAILABLE' },
      { connectorId: 2, connectorType: 'CCS2', maxPowerKw: 150, operationalStatus: 'OCCUPIED' },
      { connectorId: 3, connectorType: 'CHADEMO', maxPowerKw: 50, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 2,
    name: 'Punto Puerto Madero',
    address: 'Olga Cossettini 1200, CABA',
    latitude: -34.6106,
    longitude: -58.3625,
    distanceKm: 1.91,
    matchingConnectors: [
      { connectorId: 4, connectorType: 'CCS2', maxPowerKw: 180, operationalStatus: 'AVAILABLE' },
      { connectorId: 5, connectorType: 'CCS2', maxPowerKw: 180, operationalStatus: 'AVAILABLE' },
      { connectorId: 6, connectorType: 'TYPE_2', maxPowerKw: 22, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 3,
    name: 'Estación Palermo Soho',
    address: 'Jorge Luis Borges 1700, CABA',
    latitude: -34.5883,
    longitude: -58.4306,
    distanceKm: 4.8,
    matchingConnectors: [
      { connectorId: 7, connectorType: 'TYPE_2', maxPowerKw: 22, operationalStatus: 'OCCUPIED' },
      { connectorId: 8, connectorType: 'TYPE_2', maxPowerKw: 11, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 4,
    name: 'Recarga Recoleta',
    address: 'Av. Quintana 500, CABA',
    latitude: -34.5875,
    longitude: -58.3936,
    distanceKm: 2.11,
    matchingConnectors: [
      { connectorId: 9, connectorType: 'CCS2', maxPowerKw: 50, operationalStatus: 'AVAILABLE' },
      {
        connectorId: 10,
        connectorType: 'CHADEMO',
        maxPowerKw: 50,
        operationalStatus: 'OUT_OF_SERVICE',
      },
    ],
  },
  {
    stationId: 5,
    name: 'Punto Retiro',
    address: 'Av. del Libertador 200, CABA',
    latitude: -34.592,
    longitude: -58.374,
    distanceKm: 1.48,
    matchingConnectors: [
      { connectorId: 11, connectorType: 'CCS2', maxPowerKw: 150, operationalStatus: 'OCCUPIED' },
      { connectorId: 12, connectorType: 'TYPE_2', maxPowerKw: 11, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 6,
    name: 'Estación Belgrano',
    address: 'Av. Cabildo 2200, CABA',
    latitude: -34.561,
    longitude: -58.456,
    distanceKm: 8.3,
    matchingConnectors: [
      { connectorId: 13, connectorType: 'CCS2', maxPowerKw: 60, operationalStatus: 'AVAILABLE' },
      { connectorId: 14, connectorType: 'CHADEMO', maxPowerKw: 50, operationalStatus: 'OCCUPIED' },
    ],
  },
  {
    stationId: 7,
    name: 'Recarga Núñez',
    address: 'Av. Figueroa Alcorta 7500, CABA',
    latitude: -34.5453,
    longitude: -58.4497,
    distanceKm: 9.0,
    matchingConnectors: [
      { connectorId: 15, connectorType: 'CCS2', maxPowerKw: 120, operationalStatus: 'AVAILABLE' },
      {
        connectorId: 16,
        connectorType: 'CCS2',
        maxPowerKw: 120,
        operationalStatus: 'OUT_OF_SERVICE',
      },
      { connectorId: 17, connectorType: 'TYPE_2', maxPowerKw: 22, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 8,
    name: 'Punto Villa Urquiza',
    address: 'Av. Triunvirato 4300, CABA',
    latitude: -34.573,
    longitude: -58.49,
    distanceKm: 10.49,
    matchingConnectors: [
      { connectorId: 18, connectorType: 'TYPE_2', maxPowerKw: 7.2, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 9,
    name: 'Estación Caballito',
    address: 'Av. Rivadavia 4900, CABA',
    latitude: -34.618,
    longitude: -58.436,
    distanceKm: 5.23,
    matchingConnectors: [
      { connectorId: 19, connectorType: 'CCS2', maxPowerKw: 50, operationalStatus: 'AVAILABLE' },
      { connectorId: 20, connectorType: 'TYPE_2', maxPowerKw: 11, operationalStatus: 'OCCUPIED' },
    ],
  },
  {
    stationId: 10,
    name: 'Recarga Flores',
    address: 'Av. Rivadavia 6900, CABA',
    latitude: -34.628,
    longitude: -58.464,
    distanceKm: 8.01,
    matchingConnectors: [
      { connectorId: 21, connectorType: 'CHADEMO', maxPowerKw: 50, operationalStatus: 'AVAILABLE' },
      { connectorId: 22, connectorType: 'TYPE_2', maxPowerKw: 22, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 11,
    name: 'Punto La Boca',
    address: 'Av. Almirante Brown 1100, CABA',
    latitude: -34.6345,
    longitude: -58.363,
    distanceKm: 3.82,
    matchingConnectors: [
      {
        connectorId: 23,
        connectorType: 'CCS2',
        maxPowerKw: 50,
        operationalStatus: 'OUT_OF_SERVICE',
      },
      {
        connectorId: 24,
        connectorType: 'TYPE_2',
        maxPowerKw: 11,
        operationalStatus: 'OUT_OF_SERVICE',
      },
    ],
  },
  {
    stationId: 12,
    name: 'Estación Vicente López',
    address: 'Av. del Libertador 1900, Vicente López',
    latitude: -34.529,
    longitude: -58.479,
    distanceKm: 12.19,
    matchingConnectors: [
      { connectorId: 25, connectorType: 'CCS2', maxPowerKw: 150, operationalStatus: 'AVAILABLE' },
      { connectorId: 26, connectorType: 'CHADEMO', maxPowerKw: 50, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 13,
    name: 'Recarga San Isidro',
    address: 'Av. Centenario 1500, San Isidro',
    latitude: -34.4707,
    longitude: -58.507,
    distanceKm: 18.73,
    matchingConnectors: [
      { connectorId: 27, connectorType: 'CCS2', maxPowerKw: 180, operationalStatus: 'AVAILABLE' },
      { connectorId: 28, connectorType: 'CCS2', maxPowerKw: 60, operationalStatus: 'OCCUPIED' },
      { connectorId: 29, connectorType: 'TYPE_2', maxPowerKw: 22, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 14,
    name: 'Punto Tigre',
    address: 'Av. Cazón 1300, Tigre',
    latitude: -34.426,
    longitude: -58.5796,
    distanceKm: 26.82,
    matchingConnectors: [
      { connectorId: 30, connectorType: 'CCS2', maxPowerKw: 50, operationalStatus: 'AVAILABLE' },
      { connectorId: 31, connectorType: 'TYPE_2', maxPowerKw: 11, operationalStatus: 'AVAILABLE' },
    ],
  },
  {
    stationId: 15,
    name: 'Estación La Plata',
    address: 'Av. 7 y 50, La Plata',
    latitude: -34.9205,
    longitude: -57.9536,
    distanceKm: 52.63,
    matchingConnectors: [
      { connectorId: 32, connectorType: 'CCS2', maxPowerKw: 150, operationalStatus: 'AVAILABLE' },
      { connectorId: 33, connectorType: 'CHADEMO', maxPowerKw: 50, operationalStatus: 'OCCUPIED' },
      { connectorId: 34, connectorType: 'TYPE_2', maxPowerKw: 22, operationalStatus: 'AVAILABLE' },
    ],
  },
]
