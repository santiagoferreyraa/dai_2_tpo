package com.ecopedia.charging.booking.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

/**
 * Confirmar la reserva: alcanza con el id de la retención.
 *
 * <p>El conector y la ventana NO vienen en el cuerpo aunque el conductor los haya elegido: ya
 * están en la retención, del lado del servidor. Si viajaran, habría dos versiones del mismo dato
 * y habría que decidir cuál gana cuando no coinciden; peor todavía, un cliente podría retener una
 * ventana barata y confirmar otra.
 *
 * <p>Tampoco viene la tarjeta: en esta entrega no se cobra la seña.
 */
public record ConfirmBookingRequest(@NotNull(message = "Falta la retención a confirmar") UUID holdId) {}
