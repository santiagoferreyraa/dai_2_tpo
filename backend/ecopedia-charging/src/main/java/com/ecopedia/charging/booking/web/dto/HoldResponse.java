package com.ecopedia.charging.booking.web.dto;

import com.ecopedia.charging.booking.domain.Hold;
import java.time.Instant;
import java.util.UUID;

/**
 * Una retención recién creada. {@code expiresAt} es lo que el front necesita para mostrar
 * cuánto tiempo le queda al conductor para confirmar.
 */
public record HoldResponse(UUID id, Long connectorId, Instant start, Instant end, Instant expiresAt) {

    public static HoldResponse fromDomain(Hold hold) {
        return new HoldResponse(
                hold.id(),
                hold.connectorId(),
                hold.window().start(),
                hold.window().end(),
                hold.expiresAt());
    }
}
