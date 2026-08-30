package com.ecopedia.core.terminal.service;

import com.ecopedia.core.terminal.domain.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TerminalServiceImpl implements TerminalService {

    private final StationRepository stationRepository;
    private final ConnectorRepository connectorRepository;

    public TerminalServiceImpl(StationRepository stationRepository, ConnectorRepository connectorRepository) {
        this.stationRepository = stationRepository;
        this.connectorRepository = connectorRepository;
    }

    @Override
    public Station createStation(StationData data) {
        Station station = new Station();
        station.setName(data.name());
        station.setAddress(data.address());
        station.setLatitude(data.latitude());
        station.setLongitude(data.longitude());
        station.setPhotoUrls(data.photoUrls() != null ? data.photoUrls() : new ArrayList<>());
        station.setOwnerId(1L); // Identificador provisorio de operador
        station.setActive(true);
        return stationRepository.save(station);
    }

    @Override
    public Station updateStation(Long stationId, StationData data) {
        Station station = stationRepository
                .findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Estación no encontrada con ID: " + stationId));

        station.setName(data.name());
        station.setAddress(data.address());
        station.setLatitude(data.latitude());
        station.setLongitude(data.longitude());
        if (data.photoUrls() != null) {
            station.setPhotoUrls(data.photoUrls());
        }
        return stationRepository.save(station);
    }

    @Override
    public void deactivateStation(Long stationId) {
        Station station = stationRepository
                .findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Estación no encontrada con ID: " + stationId));
        station.setActive(false);
        stationRepository.save(station);
    }

    @Override
    public Connector addConnector(Long stationId, ConnectorType connectorType, BigDecimal maxPowerKw) {
        Station station = stationRepository
                .findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Estación no encontrada con ID: " + stationId));

        Connector connector = new Connector();
        connector.setStation(station);
        connector.setConnectorType(connectorType);
        connector.setMaxPowerKw(maxPowerKw);
        // Nace disponible: el operador lo saca de servicio después si hace falta.
        connector.setOperationalStatus(OperationalStatus.AVAILABLE);
        return connectorRepository.save(connector);
    }

    @Override
    public Connector configureConnector(Long connectorId, ConnectorType connectorType, BigDecimal maxPowerKw) {
        Connector connector = connectorRepository
                .findById(connectorId)
                .orElseThrow(() -> new IllegalArgumentException("Conector no encontrado con ID: " + connectorId));

        connector.setConnectorType(connectorType);
        connector.setMaxPowerKw(maxPowerKw);
        return connectorRepository.save(connector);
    }

    @Override
    public void changeOperationalStatus(Long connectorId, OperationalStatus operationalStatus) {
        Connector connector = connectorRepository
                .findById(connectorId)
                .orElseThrow(() -> new IllegalArgumentException("Conector no encontrado con ID: " + connectorId));

        connector.setOperationalStatus(operationalStatus);
        connectorRepository.save(connector);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StationResult> search(SearchCriteria criteria) {
        List<Station> activeStations = stationRepository.findAllActive();
        List<StationResult> results = new ArrayList<>();

        for (Station station : activeStations) {
            double distanceKm = calculateHaversineDistanceKm(
                    criteria.latitude(), criteria.longitude(),
                    station.getLatitude(), station.getLongitude());

            if (distanceKm > criteria.radiusKm()) {
                continue;
            }

            List<Connector> connectors = connectorRepository.findByStationId(station.getId());
            List<StationResult.ConnectorSummary> matchingConnectors = new ArrayList<>();

            for (Connector connector : connectors) {
                if (criteria.connectorType() != null && connector.getConnectorType() != criteria.connectorType()) {
                    continue;
                }
                if (criteria.minimumPowerKw() != null
                        && connector.getMaxPowerKw().compareTo(criteria.minimumPowerKw()) < 0) {
                    continue;
                }
                if (criteria.onlyAvailable() && connector.getOperationalStatus() != OperationalStatus.AVAILABLE) {
                    continue;
                }

                matchingConnectors.add(new StationResult.ConnectorSummary(
                        connector.getId(),
                        connector.getConnectorType(),
                        connector.getMaxPowerKw(),
                        connector.getOperationalStatus()));
            }

            results.add(new StationResult(
                    station.getId(),
                    station.getName(),
                    station.getAddress(),
                    station.getLatitude(),
                    station.getLongitude(),
                    distanceKm,
                    matchingConnectors));
        }

        results.sort(Comparator.comparingDouble(StationResult::distanceKm));
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public Connector getConnector(Long connectorId) {
        return connectorRepository
                .findById(connectorId)
                .orElseThrow(() -> new IllegalArgumentException("Conector no encontrado con ID: " + connectorId));
    }

    @Override
    @Transactional(readOnly = true)
    public Station getStation(Long stationId) {
        return stationRepository
                .findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Estación no encontrada con ID: " + stationId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Station> getAllStations() {
        return stationRepository.findAllActive();
    }

    @Override
    public void removeConnector(Long connectorId) {
        Connector connector = connectorRepository
                .findById(connectorId)
                .orElseThrow(() -> new IllegalArgumentException("Conector no encontrado con ID: " + connectorId));
        connectorRepository.delete(connector);
    }

    private static double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                        * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2)
                        * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
