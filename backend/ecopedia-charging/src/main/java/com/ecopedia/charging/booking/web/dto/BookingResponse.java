package com.ecopedia.charging.booking.web.dto;

import com.ecopedia.charging.booking.domain.Booking;
import com.ecopedia.charging.booking.domain.BookingStatus;
import java.time.Instant;

/**
 * Una reserva, como la ve el conductor.
 *
 * <p>No trae el nombre de la estación ni el del conector, que es lo que la pantalla muestra: esos
 * datos son de Terminales y viven en otro artefacto. El front ya los tiene —llegó hasta acá
 * eligiendo un conector en el mapa— y hacer que Reservas se los pidiera a core en cada listado
 * sería una llamada de red por reserva para repetir algo que el cliente ya sabe.
 *
 * <p>{@code driverId} tampoco viaja: el conductor solo recibe sus propias reservas, así que sería
 * decirle quién es a alguien que ya lo sabe.
 */
public record BookingResponse(
        Long id, Long connectorId, Instant start, Instant end, BookingStatus status, Instant createdAt) {

    public static BookingResponse fromDomain(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getConnectorId(),
                booking.getWindow().start(),
                booking.getWindow().end(),
                booking.getStatus(),
                booking.getCreatedAt());
    }
}
