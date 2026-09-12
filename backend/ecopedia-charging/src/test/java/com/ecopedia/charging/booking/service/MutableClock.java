package com.ecopedia.charging.booking.service;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

/**
 * Un reloj que la prueba mueve a mano.
 *
 * <p>Hace falta para lo que no se puede esperar de verdad: que una retención se venza sin que el
 * hilo de vencimiento la haya sacado del mapa todavía, o que una reserva quede en el pasado. Con
 * el reloj del sistema, la primera exigiría bajar el plazo a milisegundos —y entonces se prueba
 * otra cosa, porque el hilo llega antes— y la segunda, esperar una hora.
 */
class MutableClock extends Clock {

    private Instant instant;

    MutableClock(Instant instant) {
        this.instant = instant;
    }

    void advance(java.time.Duration amount) {
        instant = instant.plus(amount);
    }

    @Override
    public Instant instant() {
        return instant;
    }

    @Override
    public ZoneId getZone() {
        return ZoneId.of("UTC");
    }

    @Override
    public Clock withZone(ZoneId zone) {
        return this;
    }
}
