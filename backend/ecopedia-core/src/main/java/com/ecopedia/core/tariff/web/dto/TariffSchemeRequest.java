package com.ecopedia.core.tariff.web.dto;

import com.ecopedia.core.tariff.domain.PricingStrategyType;
import com.ecopedia.core.tariff.domain.TariffSchemeData;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record TariffSchemeRequest(
        @NotNull(message = "El ID del conector es obligatorio") Long connectorId,
        PricingStrategyType strategyType,
        @NotNull(message = "La tarifa por kWh es obligatoria") @Positive(message = "La tarifa debe ser mayor a cero")
                BigDecimal kwhRate,
        @NotNull(message = "La seña es obligatoria") @PositiveOrZero(message = "La seña no puede ser negativa")
                BigDecimal depositAmount,
        @PositiveOrZero(message = "La penalización no puede ser negativa") BigDecimal excessPenaltyPerMin,
        @Positive(message = "La tarifa pico debe ser mayor a cero") BigDecimal peakKwhRate) {
    public TariffSchemeData toDomainData() {
        return new TariffSchemeData(
                connectorId,
                strategyType != null ? strategyType : PricingStrategyType.FLAT_RATE,
                kwhRate,
                depositAmount,
                excessPenaltyPerMin != null ? excessPenaltyPerMin : BigDecimal.ZERO,
                peakKwhRate);
    }
}
