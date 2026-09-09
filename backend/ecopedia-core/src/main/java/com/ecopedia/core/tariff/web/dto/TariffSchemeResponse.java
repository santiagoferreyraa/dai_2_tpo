package com.ecopedia.core.tariff.web.dto;

import com.ecopedia.core.tariff.domain.PricingStrategyType;
import com.ecopedia.core.tariff.domain.TariffScheme;
import java.math.BigDecimal;

public record TariffSchemeResponse(
        Long id,
        Long connectorId,
        PricingStrategyType strategyType,
        BigDecimal kwhRate,
        BigDecimal depositAmount,
        BigDecimal excessPenaltyPerMin,
        BigDecimal peakKwhRate) {
    public static TariffSchemeResponse fromDomain(TariffScheme scheme) {
        return new TariffSchemeResponse(
                scheme.getId(),
                scheme.getConnectorId(),
                scheme.getStrategyType(),
                scheme.getKwhRate(),
                scheme.getDepositAmount(),
                scheme.getExcessPenaltyPerMin(),
                scheme.getPeakKwhRate());
    }
}
