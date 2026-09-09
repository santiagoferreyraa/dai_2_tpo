package com.ecopedia.core.tariff.domain;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Interfaz pública del componente {@code ServicioDeTarificacion} (stateless - ECO-29, ECO-30, RF06).
 */
public interface TariffService {

    /** Define o actualiza el esquema tarifario de un conector (ECO-29). */
    TariffScheme defineScheme(TariffSchemeData data);

    /** Consulta el esquema tarifario vigente para un conector. */
    TariffScheme getSchemeForConnector(Long connectorId);

    /** Calcula el monto de la seña requerida para reservar (RF06). */
    BigDecimal calculateDeposit(Long connectorId);

    /** Estima el importe de una carga proyectada y valida el mínimo de la seña (RF06). */
    BigDecimal estimateCost(Long connectorId, BigDecimal estimatedKwh, LocalDateTime startTime);

    /** Calcula el importe real final a cobrar tras una sesión de carga (RF14). */
    BigDecimal calculateRealCost(Long connectorId, BigDecimal kwhConsumed, long excessMinutes, LocalDateTime startTime);
}
