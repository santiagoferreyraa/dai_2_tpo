package com.ecopedia.core.tariff.domain.strategy;

import java.math.BigDecimal;

/**
 * Interfaz del Patrón Strategy para la tarificación dinámica (ECO-30).
 */
public interface PricingStrategy {

    /** Calcula la seña requerida para reservar. */
    BigDecimal calculateDeposit(PricingContext context);

    /** Estima el importe de una carga planeada. */
    BigDecimal estimateCost(PricingContext context);

    /** Calcula el costo real acumulado de una sesión de carga finalizada. */
    BigDecimal calculateRealCost(PricingContext context);
}
