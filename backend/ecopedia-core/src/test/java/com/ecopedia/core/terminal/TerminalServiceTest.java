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
    void testSearchStationsWithinRadius() {
        when(stationRepository.findAllActive()).thenReturn(List.of(mockStation));
        when(connectorRepository.findByStationId(10L)).thenReturn(List.of(mockConnector));

        SearchCriteria criteria = new SearchCriteria(-34.61300, -58.38100, 5.0, null, null, false);
        List<StationResult> results = terminalService.search(criteria);

        assertEquals(1, results.size());
        assertEquals(10L, results.get(0).stationId());
        assertTrue(results.get(0).distanceKm() < 5.0);
    }
}
