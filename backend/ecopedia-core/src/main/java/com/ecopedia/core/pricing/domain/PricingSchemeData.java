package com.ecopedia.core.pricing.domain;

import java.math.BigDecimal;

/**
 * Datos requeridos para crear o actualizar un esquema tarifario (ECO-29, RF06).
 */
public record PricingSchemeData(
        Long connectorId,
        PricingStrategyType strategyType,
        BigDecimal kwhRate,
        BigDecimal depositAmount,
        BigDecimal excessPenaltyPerMin,
        BigDecimal peakKwhRate) {}
