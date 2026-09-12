package com.ecopedia.charging.booking.domain;

import java.util.UUID;

/**
 * El conductor quiso tocar una retención o una reserva que no es suya. Se responde 403.
 *
 * <p>La regla vale aunque el front nunca ofrezca esos ids: el id de una reserva es correlativo,
 * así que probar el de al lado es trivial. La retención usa UUID justamente para que no se pueda
 * adivinar, pero la verificación se hace igual —una defensa que depende de que el otro no acierte
 * no es una defensa—.
 *
 * <p>El mensaje NO dice de quién es: confirmarle a alguien que la reserva 8 existe pero es de
 * otro ya es contar algo que no le corresponde.
 */
public class BookingAccessDeniedException extends RuntimeException {

    private BookingAccessDeniedException(String message) {
        super(message);
    }

    public static BookingAccessDeniedException forHold(UUID holdId) {
        return new BookingAccessDeniedException("La retención " + holdId + " no es tuya");
    }

    public static BookingAccessDeniedException forBooking(Long bookingId) {
        return new BookingAccessDeniedException("La reserva " + bookingId + " no es tuya");
    }
}
