package com.ecopedia.core.terminal.domain;

import java.math.BigDecimal;

/**
 * Filtros de la búsqueda geolocalizada de estaciones (RF07).
 *
 * <p>{@code connectorType} y {@code minimumPowerKw} son opcionales: en {@code null}
 * significan "sin filtro". Es la única forma de distinguir "no filtres por potencia" de
 * "filtrá por potencia cero".
 *
 * @param latitude centro de la búsqueda
 * @param longitude centro de la búsqueda
 * @param radiusKm radio en kilómetros alrededor del centro
 * @param connectorType tipo de conector exigido, o {@code null}
 * @param minimumPowerKw potencia mínima exigida en kW, o {@code null}
 * @param onlyAvailable si es {@code true}, descarta los conectores que no están disponibles
 */
public record SearchCriteria(
        double latitude,
        double longitude,
        double radiusKm,
        ConnectorType connectorType,
        BigDecimal minimumPowerKw,
        boolean onlyAvailable) {}
