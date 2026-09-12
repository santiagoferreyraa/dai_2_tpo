package com.ecopedia.charging.booking.domain;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Puerto de persistencia de {@link Booking} (patrón DAO).
 *
 * <p>La interfaz vive en la capa de negocio y la implementación en la de datos, igual que en
 * Terminales: el servicio depende de "algo que guarda reservas", no de Spring Data ni de JPA.
 */
public interface BookingRepository {

    Booking save(Booking booking);

    Optional<Booking> findById(Long bookingId);

    List<Booking> findByConnectorIdAndStatus(Long connectorId, BookingStatus status);

    /**
     * Si el conector ya tiene una reserva en ese estado que se cruza con la ventana (ECO-32).
     *
     * <p><b>Es la consulta que hace cumplir RF08</b>: confirmada una reserva, el conector queda
     * bloqueado para el resto durante esa ventana. Se pregunta antes de retener un slot y otra
     * vez antes de guardar la reserva.
     *
     * <p>Devuelve un booleano y no la lista porque quien pregunta no necesita saber con cuál
     * choca, solo si choca: así la base corta en el primer resultado en vez de traerlos todos.
     *
     * <p>La ventana viaja como dos instantes y no como {@link TimeWindow} para que la
     * implementación la pueda pasar derecho como parámetros de la consulta; el cruce se evalúa
     * con el mismo criterio semiabierto que {@link TimeWindow#overlaps}.
     */
    boolean existsOverlapping(Long connectorId, BookingStatus status, Instant start, Instant end);

    /**
     * Las reservas del conector en ese estado que se cruzan con la ventana, de la más temprana a la
     * más tarde (ECO-33).
     *
     * <p>Es la hermana de {@link #existsOverlapping}, con el mismo criterio de cruce: aquella
     * responde si choca, esta dice con cuáles. La usa la disponibilidad, que necesita las ventanas
     * para restarlas, y se acota al rango en la base para no leer el historial entero del
     * conector.
     */
    List<Booking> findOverlapping(Long connectorId, BookingStatus status, Instant start, Instant end);

    /** Las reservas de un conductor, de la más próxima a la más lejana (ECO-32). */
    List<Booking> findByDriverIdOrderByWindowStartAsc(Long driverId);
}
