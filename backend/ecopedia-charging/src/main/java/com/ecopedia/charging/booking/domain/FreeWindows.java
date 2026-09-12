package com.ecopedia.charging.booking.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;

/**
 * Los huecos libres de un rango, dadas las ventanas que ya están tomadas (ECO-33).
 *
 * <p><b>Es una función pura, a propósito.</b> No sabe de reservas, retenciones, base ni reloj:
 * recibe ventanas y devuelve ventanas. Qué cuenta como ocupado lo decide
 * {@code BookingServiceImpl}; acá solo se resta. Así el cálculo se prueba con casos chicos y
 * sin Spring, y la regla de qué bloquea un conector queda escrita en un solo lugar.
 *
 * <p>Respeta el mismo criterio semiabierto que {@link TimeWindow}: una reserva que termina a las
 * 10:00 y otra que empieza a las 10:00 no dejan un hueco de largo cero entre las dos.
 */
public final class FreeWindows {

    private FreeWindows() {}

    /**
     * Resta las ventanas ocupadas al rango y devuelve lo que queda, en orden.
     *
     * <p>Las ocupadas pueden venir en cualquier orden, pisarse entre sí o sobresalir del rango: una
     * reserva y una retención sobre el mismo horario son dos ventanas que se cruzan, y una reserva
     * que empezó antes del rango igual lo recorta.
     */
    public static List<TimeWindow> within(TimeWindow range, Collection<TimeWindow> occupied) {
        List<TimeWindow> sorted = occupied.stream()
                .filter(window -> window.overlaps(range))
                .sorted(Comparator.comparing(TimeWindow::start))
                .toList();

        List<TimeWindow> free = new ArrayList<>();
        Instant cursor = range.start();
        for (TimeWindow taken : sorted) {
            if (taken.start().isAfter(cursor)) {
                free.add(new TimeWindow(cursor, taken.start()));
            }
            // Si dos ocupadas se pisan, el cursor no retrocede: salta al fin de la que llega más lejos.
            if (taken.end().isAfter(cursor)) {
                cursor = taken.end();
            }
        }
        if (range.end().isAfter(cursor)) {
            free.add(new TimeWindow(cursor, range.end()));
        }
        return free;
    }
}
