package com.ecopedia.integration.payment.domain;

import java.util.List;
import java.util.Optional;

/** Puerto DAO de persistencia de {@link PaymentMethod} en la capa de negocio. */
public interface PaymentMethodRepository {

    PaymentMethod save(PaymentMethod paymentMethod);

    Optional<PaymentMethod> findById(Long id);

    /**
     * Las tarjetas vigentes de un conductor, de la más nueva a la más vieja.
     *
     * <p>Filtra por {@code active} en la consulta y no después en memoria: las bajas se acumulan
     * para siempre —son lógicas—, así que traer todas para descartar la mayoría es una consulta que
     * crece sin techo para devolver dos filas.
     */
    List<PaymentMethod> findByDriverIdAndActiveTrueOrderByCreatedAtDesc(Long driverId);
}
