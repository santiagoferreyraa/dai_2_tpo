package com.ecopedia.core.tariff.data;

import com.ecopedia.core.tariff.domain.TariffRepository;
import com.ecopedia.core.tariff.domain.TariffScheme;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Adaptador Spring Data JPA que implementa {@link TariffRepository}.
 */
@Repository
public interface JpaTariffRepository extends JpaRepository<TariffScheme, Long>, TariffRepository {

    @Override
    Optional<TariffScheme> findByConnectorId(Long connectorId);
}
