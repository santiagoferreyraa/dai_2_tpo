package com.ecopedia.charging.booking.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Interfaz del componente <i>Reservas</i>, <b>stateful</b>. Ver ARQUITECTURA_ECOPEDIA.md §2.3.
 *
 * <p><b>Esta interfaz es el componente</b>, no el controlador REST, igual que en Terminales.
 *
 * <p><b>Por qué es stateful.</b> Entre que el conductor elige un slot y que confirma, el slot
 * está <i>retenido</i>: ni libre ni vendido. Esa retención ({@link Hold}) es estado
 * conversacional —vive por conductor y por intento, y vence sola— y la sostiene el componente
 * mismo, no la base. El contenedor crea el componente, lo inicializa y lo destruye; ver los
 * callbacks de {@code BookingServiceImpl}.
 *
 * <p><b>Contrato publicado antes que la implementación completa, a propósito.</b> Igual que el
 * commit semilla de Terminales: las firmas quedan fijas para que ECO-32 (confirmar y cancelar)
 * y ECO-33 (solapamiento contra reservas guardadas) avancen en paralelo contra el mismo
 * contrato. ECO-31 implementa la retención y su ciclo de vida.
 *
 * <p>Las operaciones internas que consume SesionesDeCarga —la ventana disponible de un walk-in,
 * consumir y liberar una reserva— se suman con ese componente.
 *
 * <p>Cubre RF08 y, más adelante, RF09 y RF10.
 */
public interface BookingService {

    /**
     * Retiene un slot para un conductor mientras confirma (ECO-31).
     *
     * <p>Verifica que el conector exista y no esté fuera de servicio, y que nadie más tenga
     * retenida una ventana que se cruce con esta. La retención vence sola pasado el plazo
     * configurado ({@code ecopedia.booking.hold-ttl}).
     *
     * @throws ConnectorNotFoundException si el conector no existe
     * @throws ConnectorNotBookableException si el conector está fuera de servicio
     * @throws SlotUnavailableException si la ventana se cruza con otra retención vigente
     * @throws InvalidBookingRequestException si la ventana ya empezó
     */
    Hold startHold(Long connectorId, TimeWindow window, Long driverId);

    /**
     * Convierte una retención vigente en una reserva guardada (ECO-32).
     *
     * <p>Recibe el conductor y no la tarjeta, que es lo que dice el documento: en esta entrega
     * no se cobra la seña, así que la tarjeta todavía no tiene para qué viajar. El conductor sí,
     * porque solo quien retuvo el slot lo puede confirmar.
     */
    Booking confirmBooking(UUID holdId, Long driverId);

    /** Cancela una reserva del propio conductor y libera su ventana (ECO-32). */
    void cancelBooking(Long bookingId, Long driverId);

    /** Las ventanas libres de un conector dentro de un rango (ECO-33). */
    List<TimeWindow> getAvailability(Long connectorId, Instant from, Instant to);
}
