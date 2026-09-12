package com.ecopedia.charging.booking.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * La ventana horaria: que sea semiabierta y que su precisión sea la que la base puede guardar.
 *
 * <p>La precisión no es una sutileza y por eso tiene pruebas propias. La regla semiabierta se
 * cumple perfectamente en memoria y se rompía al ir a la base: el motor guarda microsegundos y
 * redondea el resto, así que un fin de ventana con nanosegundos volvía más tarde de lo pedido y
 * el slot pegado daba 409 estando libre. Intermitente, además, porque dependía de los
 * nanosegundos que diera el reloj en ese momento.
 */
class TimeWindowTest {

    @Test
    @DisplayName("Los extremos se truncan a microsegundos, que es lo que la base guarda")
    void truncatesToMicroseconds() {
        Instant withNanos = Instant.parse("2026-10-07T10:00:00.123456789Z");
        TimeWindow window = new TimeWindow(withNanos, withNanos.plus(Duration.ofHours(1)));

        assertThat(window.start()).isEqualTo(Instant.parse("2026-10-07T10:00:00.123456Z"));
        assertThat(window.end()).isEqualTo(Instant.parse("2026-10-07T11:00:00.123456Z"));
    }

    /*
     * La prueba del bug. Con los nanosegundos sin truncar, el fin de la primera ventana quedaba
     * guardado un microsegundo más tarde que el inicio de la segunda y las dos se pisaban.
     */
    @Test
    @DisplayName("Dos ventanas pegadas no se pisan, aunque el reloj traiga nanosegundos")
    void adjacentWindowsDoNotOverlap() {
        Instant start = Instant.parse("2026-10-07T10:00:00.000000700Z");
        TimeWindow first = new TimeWindow(start, start.plus(Duration.ofHours(1)));
        TimeWindow second = new TimeWindow(start.plus(Duration.ofHours(1)), start.plus(Duration.ofHours(2)));

        assertThat(first.end()).isEqualTo(second.start());
        assertThat(first.overlaps(second)).isFalse();
        assertThat(second.overlaps(first)).isFalse();
    }

    @Test
    @DisplayName("Dos ventanas que comparten algún instante se pisan")
    void overlappingWindowsOverlap() {
        Instant start = Instant.parse("2026-10-07T10:00:00Z");
        TimeWindow first = new TimeWindow(start, start.plus(Duration.ofHours(1)));
        TimeWindow half = new TimeWindow(start.plus(Duration.ofMinutes(30)), start.plus(Duration.ofMinutes(90)));

        assertThat(first.overlaps(half)).isTrue();
        assertThat(half.overlaps(first)).isTrue();
    }

    @Test
    @DisplayName("Una ventana más corta que un microsegundo no es una ventana")
    void subMicrosecondWindowIsRejected() {
        Instant start = Instant.parse("2026-10-07T10:00:00Z").plusNanos(100);

        assertThatThrownBy(() -> new TimeWindow(start, start.plusNanos(300)))
                .isInstanceOf(InvalidBookingRequestException.class);
    }

    @Test
    @DisplayName("El fin tiene que ser posterior al inicio")
    void endMustBeAfterStart() {
        Instant start = Instant.parse("2026-10-07T10:00:00Z");

        assertThatThrownBy(() -> new TimeWindow(start, start)).isInstanceOf(InvalidBookingRequestException.class);
        assertThatThrownBy(() -> new TimeWindow(start, start.minus(Duration.ofHours(1))))
                .isInstanceOf(InvalidBookingRequestException.class);
    }

    @Test
    @DisplayName("La ventana necesita inicio y fin")
    void boundsAreRequired() {
        Instant start = Instant.parse("2026-10-07T10:00:00Z").truncatedTo(ChronoUnit.MICROS);

        assertThatThrownBy(() -> new TimeWindow(null, start)).isInstanceOf(InvalidBookingRequestException.class);
        assertThatThrownBy(() -> new TimeWindow(start, null)).isInstanceOf(InvalidBookingRequestException.class);
    }
}
