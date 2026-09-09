package com.ecopedia.core.tariff.service;

import com.ecopedia.core.tariff.domain.*;
import com.ecopedia.core.tariff.domain.strategy.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TariffServiceImpl implements TariffService {

    private final TariffRepository tariffRepository;

    public TariffServiceImpl(TariffRepository tariffRepository) {
        this.tariffRepository = tariffRepository;
    }

    @Override
    public TariffScheme defineScheme(TariffSchemeData data) {
        TariffScheme scheme =
                tariffRepository.findByConnectorId(data.connectorId()).orElseGet(TariffScheme::new);

        scheme.setConnectorId(data.connectorId());
        scheme.setStrategyType(data.strategyType() != null ? data.strategyType() : PricingStrategyType.FLAT_RATE);
        scheme.setKwhRate(data.kwhRate());
        scheme.setDepositAmount(data.depositAmount());
        scheme.setExcessPenaltyPerMin(
                data.excessPenaltyPerMin() != null ? data.excessPenaltyPerMin() : BigDecimal.ZERO);
        scheme.setPeakKwhRate(data.peakKwhRate());
        scheme.setActive(true);

        return tariffRepository.save(scheme);
    }

    @Override
    @Transactional(readOnly = true)
    public TariffScheme getSchemeForConnector(Long connectorId) {
        return tariffRepository
                .findByConnectorId(connectorId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró esquema tarifario para el conector: " + connectorId));
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateDeposit(Long connectorId) {
        TariffScheme scheme = getSchemeForConnector(connectorId);
        PricingStrategy strategy = resolveStrategy(scheme.getStrategyType());
        PricingContext context = new PricingContext(scheme, BigDecimal.ZERO, 0, 0, LocalDateTime.now());
        return strategy.calculateDeposit(context);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal estimateCost(Long connectorId, BigDecimal estimatedKwh, LocalDateTime startTime) {
        TariffScheme scheme = getSchemeForConnector(connectorId);
        PricingStrategy strategy = resolveStrategy(scheme.getStrategyType());

        LocalDateTime start = startTime != null ? startTime : LocalDateTime.now();
        PricingContext context = new PricingContext(scheme, estimatedKwh, 0, 0, start);

        BigDecimal estimatedCost = strategy.estimateCost(context);
        BigDecimal deposit = strategy.calculateDeposit(context);

        // Regla RF06: El estimado nunca puede ser menor a la seña cobrada.
        if (estimatedCost.compareTo(deposit) < 0) {
            throw new IllegalArgumentException(
                    "El importe estimado (" + estimatedCost + ") no supera el monto de la seña (" + deposit + ")");
        }

        return estimatedCost;
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateRealCost(
            Long connectorId, BigDecimal kwhConsumed, long excessMinutes, LocalDateTime startTime) {
        TariffScheme scheme = getSchemeForConnector(connectorId);
        PricingStrategy strategy = resolveStrategy(scheme.getStrategyType());

        LocalDateTime start = startTime != null ? startTime : LocalDateTime.now();
        PricingContext context = new PricingContext(scheme, kwhConsumed, 0, excessMinutes, start);

        return strategy.calculateRealCost(context);
    }

    private PricingStrategy resolveStrategy(PricingStrategyType type) {
        return switch (type) {
            case FLAT_RATE -> new FlatRatePricingStrategy();
            case PEAK_OFF_PEAK -> new PeakOffPeakPricingStrategy();
            case OCCUPANCY_PENALTY -> new OccupancyPenaltyPricingStrategy();
        };
    }
}
