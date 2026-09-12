package com.ecopedia.core.pricing.data;

import com.ecopedia.core.pricing.domain.PricingScheme;
import com.ecopedia.core.pricing.domain.PricingSchemeRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Adaptador Spring Data JPA que implementa {@link PricingSchemeRepository}.
 */
@Repository
public interface JpaPricingSchemeRepository extends JpaRepository<PricingScheme, Long>, PricingSchemeRepository {

    @Override
    Optional<PricingScheme> findByConnectorId(Long connectorId);
}
