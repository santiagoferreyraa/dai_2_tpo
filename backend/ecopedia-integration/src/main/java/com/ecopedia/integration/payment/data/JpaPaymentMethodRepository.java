package com.ecopedia.integration.payment.data;

import com.ecopedia.integration.payment.domain.PaymentMethod;
import com.ecopedia.integration.payment.domain.PaymentMethodRepository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Adaptador Spring Data JPA que implementa {@link PaymentMethodRepository}.
 *
 * <p>Mismo patrón que {@code JpaUserRepository} en core: la interfaz del dominio no sabe que hay
 * JPA del otro lado, y Spring Data resuelve las consultas por el nombre del método.
 */
@Repository
public interface JpaPaymentMethodRepository extends JpaRepository<PaymentMethod, Long>, PaymentMethodRepository {

    @Override
    List<PaymentMethod> findByDriverIdAndActiveTrueOrderByCreatedAtDesc(Long driverId);
}
