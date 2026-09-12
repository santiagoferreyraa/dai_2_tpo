package com.ecopedia.core.pricing.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Entidad de Esquema Tarifario configurado por el CPO para un conector (ECO-29, RF06).
 */
@Entity
@Table(name = "pricing_schemes")
public class PricingScheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "connector_id", nullable = false, unique = true)
    private Long connectorId;

    @Enumerated(EnumType.STRING)
    @Column(name = "strategy_type", nullable = false, length = 30)
    private PricingStrategyType strategyType;

    @Column(name = "kwh_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal kwhRate;

    @Column(name = "deposit_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "excess_penalty_per_min", nullable = false, precision = 10, scale = 2)
    private BigDecimal excessPenaltyPerMin = BigDecimal.ZERO;

    @Column(name = "peak_kwh_rate", precision = 10, scale = 2)
    private BigDecimal peakKwhRate;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConnectorId() {
        return connectorId;
    }

    public void setConnectorId(Long connectorId) {
        this.connectorId = connectorId;
    }

    public PricingStrategyType getStrategyType() {
        return strategyType;
    }

    public void setStrategyType(PricingStrategyType strategyType) {
        this.strategyType = strategyType;
    }

    public BigDecimal getKwhRate() {
        return kwhRate;
    }

    public void setKwhRate(BigDecimal kwhRate) {
        this.kwhRate = kwhRate;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public void setDepositAmount(BigDecimal depositAmount) {
        this.depositAmount = depositAmount;
    }

    public BigDecimal getExcessPenaltyPerMin() {
        return excessPenaltyPerMin;
    }

    public void setExcessPenaltyPerMin(BigDecimal excessPenaltyPerMin) {
        this.excessPenaltyPerMin = excessPenaltyPerMin;
    }

    public BigDecimal getPeakKwhRate() {
        return peakKwhRate;
    }

    public void setPeakKwhRate(BigDecimal peakKwhRate) {
        this.peakKwhRate = peakKwhRate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
