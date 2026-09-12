package com.ecopedia.core.pricing.domain.strategy;

import com.ecopedia.core.pricing.domain.PricingScheme;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Contexto de parámetros para los algoritmos de cálculo del Patrón Strategy (ECO-30).
 */
public record PricingContext(
        PricingScheme scheme,
        BigDecimal kwhConsumed,
        long durationMinutes,
        long excessMinutes,
        LocalDateTime startTime) {}
