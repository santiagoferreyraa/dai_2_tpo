package com.ecopedia.core.terminal.domain;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia de {@link Connector}. Ver la nota de {@link StationRepository}
 * sobre por qué la interfaz vive en la capa de negocio.
 */
public interface ConnectorRepository {

    Connector save(Connector connector);

    Optional<Connector> findById(Long connectorId);

    List<Connector> findByStationId(Long stationId);
}
