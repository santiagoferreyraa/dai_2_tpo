package com.ecopedia.charging.booking.domain;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

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
 *
 * <p><b>Los dos extremos se truncan a microsegundos.</b> Es la precisión que guardan los dos
 * motores que usamos —{@code TIMESTAMP WITH TIME ZONE} en H2 y {@code timestamptz} en
 * PostgreSQL—, mientras que el reloj de la JVM llega a nanosegundos. Sin truncar, la ventana que
 * viaja en memoria y la que quedó guardada no son la misma: H2 <i>redondea</i> lo que no le
 * entra, así que un fin de ventana con nanosegundos para arriba vuelve de la base un poco más
 * tarde de lo que se pidió, y entonces la ventana pegada parece pisarse con la reserva anterior.
 * El síntoma era un 409 sobre un slot libre, intermitente según los nanosegundos que diera el
 * reloj. Truncando acá —en el borde del dominio, antes de validar— lo de la base y lo de memoria
 * comparan igual, y la regla semiabierta vale de los dos lados.
 *
 * <p>Se trunca antes de validar a propósito: una ventana más corta que un microsegundo queda con
 * los dos extremos iguales y la rechaza la validación de abajo, que es lo correcto. No es una
 * ventana que se pueda guardar.
 */
public record TimeWindow(Instant start, Instant end) {

    public TimeWindow {
        if (start == null || end == null) {
            throw new InvalidBookingRequestException("La ventana necesita inicio y fin");
        }
        start = start.truncatedTo(ChronoUnit.MICROS);
        end = end.truncatedTo(ChronoUnit.MICROS);
        if (!end.isAfter(start)) {
            throw new InvalidBookingRequestException("El fin de la ventana tiene que ser posterior al inicio");
        }
    }

    /** Si las dos ventanas comparten algún instante. Es la regla que usa la validación de ECO-33. */
    public boolean overlaps(TimeWindow other) {
        return start.isBefore(other.end) && other.start.isBefore(end);
    }
}
