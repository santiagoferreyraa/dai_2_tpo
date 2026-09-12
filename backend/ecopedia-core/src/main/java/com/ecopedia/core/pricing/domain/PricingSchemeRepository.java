package com.ecopedia.core.pricing.domain;

import java.util.List;
import java.util.Optional;

/**
 * Puerto DAO de persistencia de {@link PricingScheme} en la capa de negocio.
 */
public interface PricingSchemeRepository {
    PricingScheme save(PricingScheme scheme);

    Optional<PricingScheme> findByConnectorId(Long connectorId);

    List<PricingScheme> findAll();
}
