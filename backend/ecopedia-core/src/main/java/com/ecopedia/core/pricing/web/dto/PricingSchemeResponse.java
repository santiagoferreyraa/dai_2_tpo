package com.ecopedia.core.pricing.web.dto;

import com.ecopedia.core.pricing.domain.PricingScheme;
import com.ecopedia.core.pricing.domain.PricingStrategyType;
import java.math.BigDecimal;

public record PricingSchemeResponse(
        Long id,
        Long connectorId,
        PricingStrategyType strategyType,
        BigDecimal kwhRate,
        BigDecimal depositAmount,
        BigDecimal excessPenaltyPerMin,
        BigDecimal peakKwhRate) {
    public static PricingSchemeResponse fromDomain(PricingScheme scheme) {
        return new PricingSchemeResponse(
                scheme.getId(),
                scheme.getConnectorId(),
                scheme.getStrategyType(),
                scheme.getKwhRate(),
                scheme.getDepositAmount(),
                scheme.getExcessPenaltyPerMin(),
                scheme.getPeakKwhRate());
    }
}
