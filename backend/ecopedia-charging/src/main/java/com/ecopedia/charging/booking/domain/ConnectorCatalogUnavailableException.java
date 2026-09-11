package com.ecopedia.charging.booking.domain;

/**
 * No se pudo preguntarle a Terminales por el conector: core no contesta. Se responde 503.
 *
 * <p>Existe para no confundirlo con "el conector no existe" (404): el conductor tiene que poder
 * distinguir "elegí mal" de "probá de nuevo en un rato".
 */
public class ConnectorCatalogUnavailableException extends RuntimeException {

    public ConnectorCatalogUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
