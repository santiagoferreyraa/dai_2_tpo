package com.ecopedia.charging.booking.domain;

/**
 * Estado de una reserva guardada.
 *
 * <p>Arranca con los dos que necesita esta entrega. La incomparecencia (RF09) y la reserva
 * consumida al iniciar la carga (RF11) se suman cuando entren, y por eso la columna es texto y
 * no un número: agregar un estado no reinterpreta los que ya están guardados.
 */
public enum BookingStatus {
    CONFIRMED,
    CANCELLED
}
