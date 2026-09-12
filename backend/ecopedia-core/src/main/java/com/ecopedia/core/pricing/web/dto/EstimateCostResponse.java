package com.ecopedia.core.pricing.web.dto;

import java.math.BigDecimal;

public record EstimateCostResponse(
        Long connectorId, BigDecimal estimatedKwh, BigDecimal depositAmount, BigDecimal estimatedCost) {}
