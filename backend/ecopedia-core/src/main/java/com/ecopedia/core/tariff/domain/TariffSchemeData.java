package com.ecopedia.core.tariff.domain;

import java.math.BigDecimal;

/**
 * Datos requeridos para crear o actualizar un esquema tarifario (ECO-29, RF06).
 */
public record TariffSchemeData(
        Long connectorId,
        PricingStrategyType strategyType,
        BigDecimal kwhRate,
        BigDecimal depositAmount,
        BigDecimal excessPenaltyPerMin,
        BigDecimal peakKwhRate) {}
