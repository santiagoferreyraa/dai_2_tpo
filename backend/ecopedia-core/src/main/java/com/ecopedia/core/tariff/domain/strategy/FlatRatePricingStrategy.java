package com.ecopedia.core.tariff.domain.strategy;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Estrategia de Tarifa Plana (ECO-30).
 * Precio fijo por kWh consumido + penalización fija por minuto de exceso.
 */
public class FlatRatePricingStrategy implements PricingStrategy {

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
        BigDecimal penalty = BigDecimal.valueOf(context.excessMinutes())
                .multiply(context.scheme().getExcessPenaltyPerMin());

        return kwhCost.add(penalty).setScale(2, RoundingMode.HALF_UP);
    }
}
