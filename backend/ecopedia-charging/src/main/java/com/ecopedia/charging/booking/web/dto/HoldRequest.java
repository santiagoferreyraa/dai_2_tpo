package com.ecopedia.charging.booking.web.dto;

import com.ecopedia.charging.booking.domain.TimeWindow;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;

/**
 * Pedido de retención de un slot. Los instantes viajan en ISO-8601 con zona, por ejemplo
 * {@code 2026-09-14T18:00:00Z}: sin zona, "las 18" sería una hora distinta según quién la lea.
 *
 * <p>El conductor NO viene en el cuerpo: sale del token. Si viniera acá, cualquiera podría
 * retener slots a nombre de otro.
 */
public record HoldRequest(
        @NotNull(message = "Falta el conector") @Positive(message = "El conector no es válido") Long connectorId,
        @NotNull(message = "Falta el inicio de la ventana") Instant start,
        @NotNull(message = "Falta el fin de la ventana") Instant end) {

    public TimeWindow toWindow() {
        return new TimeWindow(start, end);
    }
}
