package com.ecopedia.core.tariff.domain.strategy;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Estrategia de Tarifa Dinámica Pico / Valle (ECO-30).
 * Aplica recargo de hora pico entre las 18:00 y las 22:00.
 */
public class PeakOffPeakPricingStrategy implements PricingStrategy {

    @Override
    public BigDecimal calculateDeposit(PricingContext context) {
        return context.scheme().getDepositAmount();
    }

    @Override
    public BigDecimal estimateCost(PricingContext context) {
        return calculateCostWithRate(context);
    }

    @Override
    public BigDecimal calculateRealCost(PricingContext context) {
        BigDecimal baseCost = calculateCostWithRate(context);
        BigDecimal penalty = BigDecimal.valueOf(context.excessMinutes())
                .multiply(context.scheme().getExcessPenaltyPerMin());

        return baseCost.add(penalty).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateCostWithRate(PricingContext context) {
        BigDecimal kwh = context.kwhConsumed() != null ? context.kwhConsumed() : BigDecimal.ZERO;
        LocalDateTime time = context.startTime() != null ? context.startTime() : LocalDateTime.now();

        boolean isPeakHour = time.getHour() >= 18 && time.getHour() < 22;
        BigDecimal activeRate = isPeakHour && context.scheme().getPeakKwhRate() != null
                ? context.scheme().getPeakKwhRate()
                : context.scheme().getKwhRate();

        return kwh.multiply(activeRate).setScale(2, RoundingMode.HALF_UP);
    }
}
