package com.ecopedia.charging.booking.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * El cálculo de huecos libres (ECO-33), sin reservas ni retenciones: ventanas contra ventanas.
 *
 * <p>Las horas se escriben como texto para que cada caso se lea como una agenda: de 10 a 11
 * ocupado, de 11 a 12 libre.
 */
class FreeWindowsTest {

    /** Una ventana del 14/09 entre las dos horas dadas, en formato {@code "HH:mm"}. */
    private static TimeWindow window(String from, String to) {
        return new TimeWindow(at(from), at(to));
    }

    private static Instant at(String time) {
        return Instant.parse("2026-09-14T" + time + ":00Z");
    }

    private static final TimeWindow MORNING = window("08:00", "12:00");

    @Test
    @DisplayName("Sin nada ocupado, el rango entero está libre")
    void nothingOccupied() {
        assertThat(FreeWindows.within(MORNING, List.of())).containsExactly(MORNING);
    }

    @Test
    @DisplayName("Una reserva en el medio parte el rango en dos huecos")
    void bookingInTheMiddle() {
        assertThat(FreeWindows.within(MORNING, List.of(window("09:00", "10:00"))))
                .containsExactly(window("08:00", "09:00"), window("10:00", "12:00"));
    }

    /* La regla semiabierta: dos turnos pegados no dejan entre ellos un hueco de largo cero. */
    @Test
    @DisplayName("Dos ocupadas pegadas no dejan un hueco vacío entre ellas")
    void adjacentOccupiedLeaveNoEmptyGap() {
        assertThat(FreeWindows.within(MORNING, List.of(window("09:00", "10:00"), window("10:00", "11:00"))))
                .containsExactly(window("08:00", "09:00"), window("11:00", "12:00"));
    }

    /* Es el caso de una reserva y una retención que se cruzan, o de una reserva que envuelve a otra. */
    @Test
    @DisplayName("Ocupadas que se pisan cuentan como una sola, aunque una envuelva a la otra")
    void overlappingOccupiedMerge() {
        List<TimeWindow> occupied =
                List.of(window("09:00", "11:00"), window("09:30", "10:00"), window("10:30", "11:30"));

        assertThat(FreeWindows.within(MORNING, occupied))
                .containsExactly(window("08:00", "09:00"), window("11:30", "12:00"));
    }

    @Test
    @DisplayName("El orden en que llegan las ocupadas no cambia el resultado")
    void unsortedInput() {
        assertThat(FreeWindows.within(MORNING, List.of(window("10:00", "11:00"), window("08:30", "09:00"))))
                .containsExactly(window("08:00", "08:30"), window("09:00", "10:00"), window("11:00", "12:00"));
    }

    @Test
    @DisplayName("Una ocupada que sobresale del rango lo recorta sin salirse de él")
    void occupiedStickingOutOfTheRange() {
        List<TimeWindow> occupied = List.of(window("07:00", "09:00"), window("11:00", "13:00"));

        assertThat(FreeWindows.within(MORNING, occupied)).containsExactly(window("09:00", "11:00"));
    }

    @Test
    @DisplayName("Ocupadas fuera del rango, aunque lo toquen en el borde, no lo recortan")
    void occupiedOutsideTheRange() {
        List<TimeWindow> occupied = List.of(window("06:00", "08:00"), window("12:00", "13:00"));

        assertThat(FreeWindows.within(MORNING, occupied)).containsExactly(MORNING);
    }

    @Test
    @DisplayName("Con el rango entero ocupado no queda ningún hueco")
    void fullyOccupied() {
        assertThat(FreeWindows.within(MORNING, List.of(window("07:00", "10:00"), window("10:00", "12:00"))))
                .isEmpty();
    }
}
