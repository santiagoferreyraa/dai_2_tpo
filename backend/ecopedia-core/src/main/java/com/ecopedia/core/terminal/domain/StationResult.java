package com.ecopedia.core.terminal.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * Una estación tal como la devuelve la búsqueda (RF07).
 *
 * <p>No devuelve la entidad {@link Station} por dos motivos: la búsqueda agrega la distancia
 * al punto consultado, que no es un dato de la estación sino de la consulta, y trae solo los
 * conectores que pasaron el filtro, no todos los que tiene.
 *
 * @param stationId identificador de la estación
 * @param name nombre visible
 * @param address dirección postal
 * @param latitude latitud en grados decimales
 * @param longitude longitud en grados decimales
 * @param distanceKm distancia al centro de la búsqueda, en kilómetros
 * @param matchingConnectors conectores de la estación que cumplen los filtros
 */
public record StationResult(
        Long stationId,
        String name,
        String address,
        double latitude,
        double longitude,
        double distanceKm,
        List<ConnectorSummary> matchingConnectors) {

    /**
     * Vista mínima de un conector dentro de un resultado de búsqueda: lo que el conductor
     * necesita para elegir, sin arrastrar la entidad ni su estación.
     */
    public record ConnectorSummary(
            Long connectorId,
            ConnectorType connectorType,
            BigDecimal maxPowerKw,
            OperationalStatus operationalStatus) {}
}
