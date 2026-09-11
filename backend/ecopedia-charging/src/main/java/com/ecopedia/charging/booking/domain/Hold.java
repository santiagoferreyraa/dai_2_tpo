package com.ecopedia.charging.booking.domain;

import java.time.Instant;
import java.util.UUID;

/**
 * La retención de un slot: el conector y la ventana que un conductor eligió y todavía no
 * confirmó.
 *
 * <p><b>Es el estado conversacional de Reservas</b>, y la razón de que el componente sea
 * stateful (ARQUITECTURA_ECOPEDIA.md §2.1). Mientras existe, el slot no está ni libre ni
 * vendido: nadie más lo puede tomar, pero tampoco hay una reserva guardada. Por eso no se
 * persiste —una tabla de retenciones sería una tabla de reservas fantasma— y vence sola.
 *
 * <p>El id es un UUID y no un número correlativo: lo recibe el cliente para confirmar, y con un
 * correlativo cualquiera podría adivinar la retención del conductor de al lado.
 */
public record Hold(UUID id, Long connectorId, Long driverId, TimeWindow window, Instant expiresAt) {

    /** Si la retención ya venció en ese instante. */
    public boolean isExpiredAt(Instant now) {
        return !now.isBefore(expiresAt);
    }
}
