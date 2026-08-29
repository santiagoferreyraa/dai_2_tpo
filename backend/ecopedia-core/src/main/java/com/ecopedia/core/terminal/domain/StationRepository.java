package com.ecopedia.core.terminal.domain;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia de {@link Station}.
 *
 * <p>Se declara acá, en la capa de negocio, y se implementa en la capa de datos. Ese es el
 * sentido del patrón DAO en este proyecto: la capa de negocio dice qué necesita y no se
 * entera de si eso sale de JPA, de un archivo o de un tercero.
 *
 * <p>Solo tiene lo elemental. Las consultas de la búsqueda —radio, tipo de conector,
 * potencia mínima, disponibilidad— las agrega el carril de datos (ECO-14), que es quien las
 * va a implementar.
 */
public interface StationRepository {

    Station save(Station station);

    Optional<Station> findById(Long stationId);

    List<Station> findAllActive();
}
