package com.ecopedia.core.terminal.web;

import com.ecopedia.core.terminal.domain.*;
import com.ecopedia.core.terminal.web.dto.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TerminalController {

    private final TerminalService terminalService;

    public TerminalController(TerminalService terminalService) {
        this.terminalService = terminalService;
    }

    /** RF04: Alta de una estación de carga. */
    @PostMapping("/estaciones")
    public ResponseEntity<StationResponse> createStation(@Valid @RequestBody StationRequest request) {
        Station created = terminalService.createStation(request.toDomainData());
        return ResponseEntity.status(HttpStatus.CREATED).body(StationResponse.fromDomain(created));
    }

    /** RF04: Edición de datos de una estación. */
    @PutMapping("/estaciones/{id}")
    public ResponseEntity<StationResponse> updateStation(
            @PathVariable Long id, @Valid @RequestBody StationRequest request) {
        Station updated = terminalService.updateStation(id, request.toDomainData());
        return ResponseEntity.ok(StationResponse.fromDomain(updated));
    }

    /** RF04: Baja lógica de una estación. */
    @DeleteMapping("/estaciones/{id}")
    public ResponseEntity<Void> deactivateStation(@PathVariable Long id) {
        terminalService.deactivateStation(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * RF05: Alta de un conector sobre una estación existente.
     *
     * <p>La ruta va en inglés por la directriz de código: el resto del controlador todavía
     * está en castellano y se unifica cuando se apliquen las rutas de ARQUITECTURA §2.3.
     */
    @PostMapping("/stations/{stationId}/connectors")
    public ResponseEntity<ConnectorResponse> addConnector(
            @PathVariable Long stationId, @Valid @RequestBody ConfigureConnectorRequest request) {
        Connector created = terminalService.addConnector(stationId, request.connectorType(), request.maxPowerKw());
        return ResponseEntity.status(HttpStatus.CREATED).body(ConnectorResponse.fromDomain(created));
    }

    /** RF05: Parametrizar tipo y potencia máxima de un conector que ya existe. */
    @PostMapping("/conectores/{id}/configurar")
    public ResponseEntity<ConnectorResponse> configureConnector(
            @PathVariable Long id, @Valid @RequestBody ConfigureConnectorRequest request) {
        Connector configured = terminalService.configureConnector(id, request.connectorType(), request.maxPowerKw());
        return ResponseEntity.ok(ConnectorResponse.fromDomain(configured));
    }

    /** RF05: Cambiar el estado operativo de un conector. */
    @PatchMapping("/conectores/{id}/estado")
    public ResponseEntity<Void> changeOperationalStatus(
            @PathVariable Long id, @Valid @RequestBody ChangeStatusRequest request) {
        terminalService.changeOperationalStatus(id, request.operationalStatus());
        return ResponseEntity.ok().build();
    }

    /** RF07: Búsqueda geolocalizada con filtros. */
    @GetMapping("/busqueda")
    public ResponseEntity<List<StationResult>> search(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10.0") double radioKm,
            @RequestParam(required = false) ConnectorType connectorType,
            @RequestParam(required = false) BigDecimal minimumPowerKw,
            @RequestParam(defaultValue = "false") boolean onlyAvailable) {

        SearchCriteria criteria = new SearchCriteria(lat, lon, radioKm, connectorType, minimumPowerKw, onlyAvailable);
        List<StationResult> results = terminalService.search(criteria);
        return ResponseEntity.ok(results);
    }

    /** Operación interna / consulta de conector. */
    @GetMapping("/conectores/{id}")
    public ResponseEntity<ConnectorResponse> getConnector(@PathVariable Long id) {
        Connector connector = terminalService.getConnector(id);
        return ResponseEntity.ok(ConnectorResponse.fromDomain(connector));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
