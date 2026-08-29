package com.ecopedia.core.terminal.domain;

import java.math.BigDecimal;
import java.util.List;

/**
 * Interfaz del componente <i>Terminales</i>, stateless. Ver ARQUITECTURA_ECOPEDIA.md §2.3.
 *
 * <p><b>Esta interfaz es el componente</b>, no el controlador REST: el controlador es un
 * transporte que expone parte de ella. Por eso {@link #getConnector(Long)} no tiene ruta
 * HTTP — lo consumen Reservas y SesionesDeCarga desde adentro del sistema.
 *
 * <p>Es stateless porque ninguna de estas operaciones deja nada colgado entre llamadas: lo
 * que persiste es dominio guardado en la base, no estado conversacional que el contenedor
 * tenga que sostener.
 *
 * <p>Las operaciones están declaradas y sin implementar a propósito: el commit semilla fija
 * las firmas para que los carriles de datos, negocio, presentación y frontend puedan avanzar
 * en paralelo contra el mismo contrato.
 *
 * <p>Cubre RF04, RF05, RF07 y la mitad de RF03.
 */
public interface TerminalService {

    /** Alta de una estación. La publica el operador que la registra (RF04). */
    Station createStation(StationData data);

    /** Edición de los datos de una estación existente (RF04). */
    Station updateStation(Long stationId, StationData data);

    /** Baja lógica de una estación: deja de aparecer en la búsqueda (RF04). */
    void deactivateStation(Long stationId);

    /** Parametriza tipo y potencia máxima de un conector (RF05). */
    Connector configureConnector(Long connectorId, ConnectorType connectorType, BigDecimal maxPowerKw);

    /**
     * Cambia el estado operativo de un conector (RF05).
     *
     * <p>Tiene dos consumidores muy distintos: el operador desde el ABM, y SesionesDeCarga
     * cuando ocupa y libera el conector.
     */
    void changeOperationalStatus(Long connectorId, OperationalStatus operationalStatus);

    /** Búsqueda geolocalizada con filtros de conector, potencia y disponibilidad (RF07). */
    List<StationResult> search(SearchCriteria criteria);

    /**
     * Devuelve un conector por su identificador.
     *
     * <p>Operación interna: la usan Reservas y SesionesDeCarga para verificar que el conector
     * exista y esté operativo antes de comprometer una reserva o habilitar una carga.
     */
    Connector getConnector(Long connectorId);
}
