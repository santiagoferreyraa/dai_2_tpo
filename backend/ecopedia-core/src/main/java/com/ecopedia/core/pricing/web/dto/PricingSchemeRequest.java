package com.ecopedia.core.pricing.web.dto;

import com.ecopedia.core.pricing.domain.PricingSchemeData;
import com.ecopedia.core.pricing.domain.PricingStrategyType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record PricingSchemeRequest(
        @NotNull(message = "El ID del conector es obligatorio") Long connectorId,
        PricingStrategyType strategyType,
        @NotNull(message = "La tarifa por kWh es obligatoria") @Positive(message = "La tarifa debe ser mayor a cero")
                BigDecimal kwhRate,
        @NotNull(message = "La seña es obligatoria") @PositiveOrZero(message = "La seña no puede ser negativa")
                BigDecimal depositAmount,
        @PositiveOrZero(message = "La penalización no puede ser negativa") BigDecimal excessPenaltyPerMin,
        @Positive(message = "La tarifa pico debe ser mayor a cero") BigDecimal peakKwhRate) {
    public PricingSchemeData toDomainData() {
        return new PricingSchemeData(
                connectorId,
                strategyType != null ? strategyType : PricingStrategyType.FLAT_RATE,
                kwhRate,
                depositAmount,
                excessPenaltyPerMin != null ? excessPenaltyPerMin : BigDecimal.ZERO,
                peakKwhRate);
    }
}
