package com.ecopedia.core.tariff.domain;

import java.util.List;
import java.util.Optional;

/**
 * Puerto DAO de persistencia de {@link TariffScheme} en la capa de negocio.
 */
public interface TariffRepository {
    TariffScheme save(TariffScheme scheme);

    Optional<TariffScheme> findByConnectorId(Long connectorId);

    List<TariffScheme> findAll();
}
