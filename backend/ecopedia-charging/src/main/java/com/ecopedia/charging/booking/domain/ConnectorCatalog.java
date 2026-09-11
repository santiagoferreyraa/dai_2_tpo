package com.ecopedia.charging.booking.domain;

import java.util.Optional;

/**
 * Lo que Reservas necesita saber de Terminales: si un conector existe y en qué estado está.
 *
 * <p><b>Es un puerto y no una llamada directa a {@code TerminalService}</b>, porque Terminales
 * vive en otro proceso ({@code ecopedia-core}). La implementación habla HTTP con core; el
 * servicio de reservas no se entera, y en los tests se reemplaza sin levantar core.
 */
public interface ConnectorCatalog {

    /**
     * El conector, o vacío si no existe.
     *
     * @throws ConnectorCatalogUnavailableException si core no contesta: no es lo mismo que "no
     *     existe", y confundirlos le diría al conductor que el conector no está cuando en
     *     realidad no pudimos preguntar.
     */
    Optional<ConnectorSnapshot> findConnector(Long connectorId);
}
