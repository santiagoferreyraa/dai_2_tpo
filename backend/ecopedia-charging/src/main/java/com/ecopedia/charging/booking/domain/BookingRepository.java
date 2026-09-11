package com.ecopedia.charging.booking.domain;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia de {@link Booking} (patrón DAO).
 *
 * <p>La interfaz vive en la capa de negocio y la implementación en la de datos, igual que en
 * Terminales: el servicio depende de "algo que guarda reservas", no de Spring Data ni de JPA.
 *
 * <p>Arranca con lo mínimo. La consulta de reservas que se cruzan con una ventana la agrega
 * ECO-33, que es quien la necesita.
 */
public interface BookingRepository {

    Booking save(Booking booking);

    Optional<Booking> findById(Long bookingId);

    List<Booking> findByConnectorIdAndStatus(Long connectorId, BookingStatus status);
}
