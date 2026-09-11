package com.ecopedia.charging.booking.domain;

import java.time.Instant;

/**
 * Una ventana horaria sobre un conector: desde cuándo y hasta cuándo.
 *
 * <p><b>Es semiabierta, {@code [start, end)}.</b> Una ventana que termina a las 10:00 y otra que
 * empieza a las 10:00 NO se pisan: el conector queda libre justo en el instante en que la
 * segunda lo toma. Con los dos extremos cerrados, dos turnos consecutivos chocarían entre sí y
 * no se podría reservar nada pegado a otra reserva.
 *
 * <p>Se valida al construirse, así que una ventana que existe siempre tiene sentido: nadie
 * más adelante tiene que preguntarse si el fin puede venir antes que el inicio.
 */
public record TimeWindow(Instant start, Instant end) {

    public TimeWindow {
        if (start == null || end == null) {
            throw new InvalidBookingRequestException("La ventana necesita inicio y fin");
        }
        if (!end.isAfter(start)) {
            throw new InvalidBookingRequestException("El fin de la ventana tiene que ser posterior al inicio");
        }
    }

    /** Si las dos ventanas comparten algún instante. Es la regla que usa la validación de ECO-33. */
    public boolean overlaps(TimeWindow other) {
        return start.isBefore(other.end) && other.start.isBefore(end);
    }
}
