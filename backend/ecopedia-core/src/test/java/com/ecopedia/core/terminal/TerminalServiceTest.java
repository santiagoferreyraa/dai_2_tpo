package com.ecopedia.core.terminal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.ecopedia.core.terminal.domain.*;
import com.ecopedia.core.terminal.service.TerminalServiceImpl;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class TerminalServiceTest {

    @Mock
    private StationRepository stationRepository;

    @Mock
    private ConnectorRepository connectorRepository;

    @InjectMocks
    private TerminalServiceImpl terminalService;

    private Station mockStation;
    private Connector mockConnector;

    @BeforeEach
    void setUp() {
        mockStation = new Station();
        mockStation.setId(10L);
        mockStation.setName("Estación UADE Obelisco");
        mockStation.setAddress("Lima 775, CABA");
        mockStation.setLatitude(-34.61315);
        mockStation.setLongitude(-58.38138);
        mockStation.setActive(true);

        mockConnector = new Connector();
        mockConnector.setId(1L);
        mockConnector.setStation(mockStation);
        mockConnector.setConnectorType(ConnectorType.CCS2);
        mockConnector.setMaxPowerKw(new BigDecimal("50.00"));
        mockConnector.setOperationalStatus(OperationalStatus.AVAILABLE);
    }

    @Test
    void testCreateStation() {
        when(stationRepository.save(any(Station.class))).thenReturn(mockStation);

        StationData data = new StationData("Estación UADE Obelisco", "Lima 775, CABA", -34.61315, -58.38138, List.of());
        Station created = terminalService.createStation(data);

        assertNotNull(created);
        assertEquals("Estación UADE Obelisco", created.getName());
        verify(stationRepository, times(1)).save(any(Station.class));
    }

    @Test
    void testDeactivateStation() {
        when(stationRepository.findById(10L)).thenReturn(Optional.of(mockStation));

        terminalService.deactivateStation(10L);

        assertFalse(mockStation.isActive());
        verify(stationRepository, times(1)).save(mockStation);
    }

    @Test
    void testConfigureConnector() {
        when(connectorRepository.findById(1L)).thenReturn(Optional.of(mockConnector));
        when(connectorRepository.save(any(Connector.class))).thenReturn(mockConnector);

        Connector updated = terminalService.configureConnector(1L, ConnectorType.TYPE_2, new BigDecimal("22.00"));

        assertEquals(ConnectorType.TYPE_2, updated.getConnectorType());
        assertEquals(new BigDecimal("22.00"), updated.getMaxPowerKw());
        verify(connectorRepository, times(1)).save(mockConnector);
    }

    @Test
    void testAddConnector() {
        when(stationRepository.findById(10L)).thenReturn(Optional.of(mockStation));
        when(connectorRepository.save(any(Connector.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Connector created = terminalService.addConnector(10L, ConnectorType.CHADEMO, new BigDecimal("100.00"));

        assertSame(mockStation, created.getStation());
        assertEquals(ConnectorType.CHADEMO, created.getConnectorType());
        assertEquals(new BigDecimal("100.00"), created.getMaxPowerKw());
        assertEquals(OperationalStatus.AVAILABLE, created.getOperationalStatus());
    }

    /**
     * El caso que la operación ambigua anterior no podía cubrir: los identificadores de
     * estación y de conector son secuencias independientes, así que una operación que
     * aceptara cualquiera de los dos dejaba de crear en cuanto existía un conector con el
     * mismo número que la estación.
     */
    @Test
    void testAddSecondConnectorToSameStation() {
        when(stationRepository.findById(10L)).thenReturn(Optional.of(mockStation));
        when(connectorRepository.save(any(Connector.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Connector first = terminalService.addConnector(10L, ConnectorType.CCS2, new BigDecimal("50.00"));
        Connector second = terminalService.addConnector(10L, ConnectorType.TYPE_2, new BigDecimal("22.00"));

        assertNotSame(first, second);
        assertEquals(ConnectorType.CCS2, first.getConnectorType());
        assertEquals(ConnectorType.TYPE_2, second.getConnectorType());
        verify(connectorRepository, times(2)).save(any(Connector.class));
    }

    @Test
    void testAddConnectorToMissingStation() {
        when(stationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> terminalService.addConnector(99L, ConnectorType.CCS2, new BigDecimal("50.00")));
        verify(connectorRepository, never()).save(any(Connector.class));
    }

    @Test
    void testConfigureMissingConnector() {
        when(connectorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(
                IllegalArgumentException.class,
                () -> terminalService.configureConnector(99L, ConnectorType.CCS2, new BigDecimal("50.00")));
        verify(connectorRepository, never()).save(any(Connector.class));
    }

    @Test
    void testSearchStationsWithinRadius() {
        when(stationRepository.findAllActive()).thenReturn(List.of(mockStation));
        when(connectorRepository.findByStationId(10L)).thenReturn(List.of(mockConnector));

        SearchCriteria criteria = new SearchCriteria(-34.61300, -58.38100, 5.0, null, null, false);
        List<StationResult> results = terminalService.search(criteria);

        assertEquals(1, results.size());
        assertEquals(10L, results.get(0).stationId());
        assertTrue(results.get(0).distanceKm() < 5.0);
    }

    @Test
    void testSearchCombinedFiltersEdgeCases() {
        when(stationRepository.findAllActive()).thenReturn(List.of(mockStation));
        when(connectorRepository.findByStationId(10L)).thenReturn(List.of(mockConnector));

        // 1. All filters match: CCS2, min 40kW, onlyAvailable = true -> 1 matching connector
        SearchCriteria matchAll =
                new SearchCriteria(-34.61300, -58.38100, 5.0, ConnectorType.CCS2, new BigDecimal("40.00"), true);
        List<StationResult> res1 = terminalService.search(matchAll);
        assertEquals(1, res1.size());
        assertEquals(1, res1.get(0).matchingConnectors().size());

        // 2. Mismatched type: CHADEMO -> 0 matching connectors
        SearchCriteria typeMismatch =
                new SearchCriteria(-34.61300, -58.38100, 5.0, ConnectorType.CHADEMO, new BigDecimal("40.00"), true);
        List<StationResult> res2 = terminalService.search(typeMismatch);
        assertEquals(1, res2.size());
        assertTrue(res2.get(0).matchingConnectors().isEmpty());

        // 3. Mismatched power: min 100kW (connector has 50kW) -> 0 matching connectors
        SearchCriteria powerMismatch =
                new SearchCriteria(-34.61300, -58.38100, 5.0, ConnectorType.CCS2, new BigDecimal("100.00"), true);
        List<StationResult> res3 = terminalService.search(powerMismatch);
        assertEquals(1, res3.size());
        assertTrue(res3.get(0).matchingConnectors().isEmpty());

        // 4. Mismatched availability: connector OUT_OF_SERVICE with onlyAvailable = true -> 0 matching connectors
        mockConnector.setOperationalStatus(OperationalStatus.OUT_OF_SERVICE);
        SearchCriteria unavailableMismatch =
                new SearchCriteria(-34.61300, -58.38100, 5.0, ConnectorType.CCS2, new BigDecimal("40.00"), true);
        List<StationResult> res4 = terminalService.search(unavailableMismatch);
        assertEquals(1, res4.size());
        assertTrue(res4.get(0).matchingConnectors().isEmpty());
    }
}
