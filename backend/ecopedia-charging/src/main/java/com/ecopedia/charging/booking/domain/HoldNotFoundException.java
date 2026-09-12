package com.ecopedia.charging.booking.domain;

import java.util.UUID;

/** No hay ninguna retención con ese id. Se responde 404. */
public class HoldNotFoundException extends RuntimeException {

    public HoldNotFoundException(UUID holdId) {
        super("La retención " + holdId + " no existe");
    }
}
