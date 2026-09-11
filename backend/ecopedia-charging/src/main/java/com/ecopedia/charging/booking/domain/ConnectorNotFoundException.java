package com.ecopedia.charging.booking.domain;

/** El conector no existe en Terminales. Se responde 404. */
public class ConnectorNotFoundException extends RuntimeException {

    public ConnectorNotFoundException(Long connectorId) {
        super("El conector " + connectorId + " no existe");
    }
}
