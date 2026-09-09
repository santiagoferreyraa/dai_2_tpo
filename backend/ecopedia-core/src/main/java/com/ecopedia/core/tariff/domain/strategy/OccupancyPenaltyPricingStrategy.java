package com.ecopedia.core.tariff.domain.strategy;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Estrategia con Recargo Progresivo por Permanencia Excesiva (ECO-30).
 */
public class OccupancyPenaltyPricingStrategy implements PricingStrategy {

    @Override
    public BigDecimal calculateDeposit(PricingContext context) {
        return context.scheme().getDepositAmount();
    }

    @Override
    public BigDecimal estimateCost(PricingContext context) {
        BigDecimal kwh = context.kwhConsumed() != null ? context.kwhConsumed() : BigDecimal.ZERO;
        return kwh.multiply(context.scheme().getKwhRate()).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal calculateRealCost(PricingContext context) {
        BigDecimal kwhCost = context.kwhConsumed().multiply(context.scheme().getKwhRate());
        long excess = context.excessMinutes();

        BigDecimal penaltyRate = context.scheme().getExcessPenaltyPerMin();
        if (excess > 15) {
            penaltyRate = penaltyRate.multiply(BigDecimal.valueOf(1.5));
        }

        BigDecimal penalty = BigDecimal.valueOf(excess).multiply(penaltyRate);
        return kwhCost.add(penalty).setScale(2, RoundingMode.HALF_UP);
    }
}
