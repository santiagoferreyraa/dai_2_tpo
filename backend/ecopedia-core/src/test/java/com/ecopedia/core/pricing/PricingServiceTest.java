package com.ecopedia.core.pricing;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.ecopedia.core.pricing.domain.*;
import com.ecopedia.core.pricing.domain.strategy.FlatRatePricingStrategy;
import com.ecopedia.core.pricing.domain.strategy.OccupancyPenaltyPricingStrategy;
import com.ecopedia.core.pricing.domain.strategy.PeakOffPeakPricingStrategy;
import com.ecopedia.core.pricing.domain.strategy.PricingContext;
import com.ecopedia.core.pricing.service.PricingServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PricingServiceTest {

    @Mock
    private PricingSchemeRepository pricingSchemeRepository;

    @InjectMocks
    private PricingServiceImpl pricingService;

    private PricingScheme mockFlatScheme;

    @BeforeEach
    void setUp() {
        mockFlatScheme = new PricingScheme();
        mockFlatScheme.setId(1L);
        mockFlatScheme.setConnectorId(10L);
        mockFlatScheme.setStrategyType(PricingStrategyType.FLAT_RATE);
        mockFlatScheme.setKwhRate(new BigDecimal("10.00"));
        mockFlatScheme.setDepositAmount(new BigDecimal("100.00"));
        mockFlatScheme.setExcessPenaltyPerMin(new BigDecimal("2.00"));
    }

    @Test
    void testFlatRatePricingStrategy() {
        FlatRatePricingStrategy strategy = new FlatRatePricingStrategy();
        PricingContext context =
                new PricingContext(mockFlatScheme, new BigDecimal("15.00"), 30, 5, LocalDateTime.now());

        BigDecimal deposit = strategy.calculateDeposit(context);
        BigDecimal estimate = strategy.estimateCost(context);
        BigDecimal realCost = strategy.calculateRealCost(context);

        assertEquals(new BigDecimal("100.00"), deposit);
        assertEquals(new BigDecimal("150.00"), estimate); // 15 kWh * 10 = 150
        assertEquals(new BigDecimal("160.00"), realCost); // 150 + 5 min * 2 = 160
    }

    @Test
    void testPeakOffPeakPricingStrategy() {
        mockFlatScheme.setStrategyType(PricingStrategyType.PEAK_OFF_PEAK);
        mockFlatScheme.setPeakKwhRate(new BigDecimal("20.00"));

        PeakOffPeakPricingStrategy strategy = new PeakOffPeakPricingStrategy();

        LocalDateTime offPeakTime = LocalDateTime.of(2026, 9, 7, 14, 0); // 14:00 (valle)
        PricingContext offPeakContext = new PricingContext(mockFlatScheme, new BigDecimal("10.00"), 30, 0, offPeakTime);
        BigDecimal offPeakCost = strategy.estimateCost(offPeakContext);

        LocalDateTime peakTime = LocalDateTime.of(2026, 9, 7, 19, 0); // 19:00 (pico)
        PricingContext peakContext = new PricingContext(mockFlatScheme, new BigDecimal("10.00"), 30, 0, peakTime);
        BigDecimal peakCost = strategy.estimateCost(peakContext);

        assertEquals(new BigDecimal("100.00"), offPeakCost); // 10 kWh * 10
        assertEquals(new BigDecimal("200.00"), peakCost); // 10 kWh * 20
    }

    @Test
    void testOccupancyPenaltyPricingStrategyProgressive() {
        OccupancyPenaltyPricingStrategy strategy = new OccupancyPenaltyPricingStrategy();
        PricingContext context =
                new PricingContext(mockFlatScheme, new BigDecimal("10.00"), 30, 20, LocalDateTime.now());

        BigDecimal realCost = strategy.calculateRealCost(context);

        // kWh = 10 * 10 = 100.
        // Excess > 15 min -> penalty rate = 2.00 * 1.5 = 3.00 per min.
        // Penalty = 20 * 3.00 = 60.
        // Total = 160.00
        assertEquals(new BigDecimal("160.00"), realCost);
    }

    @Test
    void testEstimateCostFailsWhenLessThanDepositRF06() {
        when(pricingSchemeRepository.findByConnectorId(10L)).thenReturn(Optional.of(mockFlatScheme));

        // 5 kWh * $10 = $50. Seña = $100.
        // Debe lanzar IllegalArgumentException según RF06.
        assertThrows(
                IllegalArgumentException.class,
                () -> pricingService.estimateCost(10L, new BigDecimal("5.00"), LocalDateTime.now()));
    }

    @Test
    void testDefineSchemeSuccess() {
        when(pricingSchemeRepository.findByConnectorId(10L)).thenReturn(Optional.empty());
        when(pricingSchemeRepository.save(any(PricingScheme.class))).thenReturn(mockFlatScheme);

        PricingSchemeData data = new PricingSchemeData(
                10L,
                PricingStrategyType.FLAT_RATE,
                new BigDecimal("10.00"),
                new BigDecimal("100.00"),
                new BigDecimal("2.00"),
                null);
        PricingScheme saved = pricingService.defineScheme(data);

        assertNotNull(saved);
        assertEquals(10L, saved.getConnectorId());
        verify(pricingSchemeRepository, times(1)).save(any(PricingScheme.class));
    }
}
