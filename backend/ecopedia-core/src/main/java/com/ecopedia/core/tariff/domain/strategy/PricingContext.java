package com.ecopedia.core.tariff.domain.strategy;

import com.ecopedia.core.tariff.domain.TariffScheme;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Contexto de parámetros para los algoritmos de cálculo del Patrón Strategy (ECO-30).
 */
public record PricingContext(
        TariffScheme scheme,
        BigDecimal kwhConsumed,
        long durationMinutes,
        long excessMinutes,
        LocalDateTime startTime) {}
