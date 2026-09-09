package com.ecopedia.core.terminal.web;

import com.ecopedia.core.terminal.domain.*;
import com.ecopedia.core.terminal.web.dto.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Capa de presentación del componente {@code ServicioDeTerminales}.
 *
 * <p><b>Dónde va la autorización y por qué acá.</b> Las anotaciones {@code @PreAuthorize} van
 * sobre los métodos del controlador, no sobre los del servicio, y es deliberado: Reservas y
 * SesionesDeCarga consumen {@code TerminalService} en proceso —{@code getConnector} y
 * {@code changeOperationalStatus} están marcadas como operaciones internas en
 * ARQUITECTURA_ECOPEDIA.md §2.3—, y esas llamadas no las origina un usuario sino el sistema.
 * Con la regla en el servicio habría que inventarles un rol técnico para que pudieran pasar.
 * Acá el alcance queda en la puerta HTTP, que es exactamente lo que hay que proteger.
 *
 * <p><b>Por qué {@code 'CPO'} y no {@code 'OPERATOR'}.</b> {@code hasRole('X')} busca la
 * autoridad {@code ROLE_X}, y {@code JwtAuthenticationFilter} la arma como
 * {@code "ROLE_" + role.name()} sobre el enum {@link com.ecopedia.core.user.domain.Role}, que
 * dice {@code CPO}. El documento de arquitectura nombra el rol {@code OPERATOR}: la
 * divergencia entre documento y código es una decisión tomada, no un descuido.
 */
@RestController
@RequestMapping("/api")
public class TerminalController {

    private final TerminalService terminalService;

    public TerminalController(TerminalService terminalService) {
        this.terminalService = terminalService;
    }

    /** RF04: Alta de una estación de carga. */
    @PostMapping("/stations")
    @PreAuthorize("hasRole('CPO')")
    public ResponseEntity<StationResponse> createStation(@Valid @RequestBody StationRequest request) {
        Station created = terminalService.createStation(request.toDomainData());
        return ResponseEntity.status(HttpStatus.CREATED).body(StationResponse.fromDomain(created));
    }

    /** RF04: Edición de datos de una estación. */
    @PutMapping("/stations/{id}")
    @PreAuthorize("hasRole('CPO')")
    public ResponseEntity<StationResponse> updateStation(
            @PathVariable Long id, @Valid @RequestBody StationRequest request) {
        Station updated = terminalService.updateStation(id, request.toDomainData());
        return ResponseEntity.ok(StationResponse.fromDomain(updated));
    }

    /** RF04: Baja lógica de una estación. */
    @DeleteMapping("/stations/{id}")
    @PreAuthorize("hasAnyRole('CPO','ADMIN')")
    public ResponseEntity<Void> deactivateStation(@PathVariable Long id) {
        terminalService.deactivateStation(id);
        return ResponseEntity.noContent().build();
    }

    /** RF05: Alta de un conector sobre una estación existente. */
    @PostMapping("/stations/{stationId}/connectors")
    @PreAuthorize("hasRole('CPO')")
    public ResponseEntity<ConnectorResponse> addConnector(
            @PathVariable Long stationId, @Valid @RequestBody ConfigureConnectorRequest request) {
        Connector created = terminalService.addConnector(stationId, request.connectorType(), request.maxPowerKw());
        return ResponseEntity.status(HttpStatus.CREATED).body(ConnectorResponse.fromDomain(created));
    }

    /** RF05: Parametrizar tipo y potencia máxima de un conector que ya existe. */
    @PostMapping("/connectors/{id}/configure")
    @PreAuthorize("hasRole('CPO')")
    public ResponseEntity<ConnectorResponse> configureConnector(
            @PathVariable Long id, @Valid @RequestBody ConfigureConnectorRequest request) {
        Connector configured = terminalService.configureConnector(id, request.connectorType(), request.maxPowerKw());
        return ResponseEntity.ok(ConnectorResponse.fromDomain(configured));
    }

    /** RF05: Cambiar el estado operativo de un conector. */
    @PatchMapping("/connectors/{id}/status")
    @PreAuthorize("hasRole('CPO')")
    public ResponseEntity<Void> changeOperationalStatus(
            @PathVariable Long id, @Valid @RequestBody ChangeStatusRequest request) {
        terminalService.changeOperationalStatus(id, request.operationalStatus());
        return ResponseEntity.ok().build();
    }

    /** RF07: Búsqueda geolocalizada con filtros. */
    @GetMapping("/search")
    public ResponseEntity<List<StationResult>> search(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "10.0") @Positive(message = "El radio debe ser mayor que cero")
                    double radiusKm,
            @RequestParam(required = false) ConnectorType connectorType,
            @RequestParam(required = false) BigDecimal minimumPowerKw,
            @RequestParam(defaultValue = "false") boolean onlyAvailable) {

        SearchCriteria criteria = new SearchCriteria(lat, lon, radiusKm, connectorType, minimumPowerKw, onlyAvailable);
        List<StationResult> results = terminalService.search(criteria);
        return ResponseEntity.ok(results);
    }

    /** Listar todas las estaciones activas. */
    @GetMapping("/stations")
    public ResponseEntity<List<StationResponse>> getAllStations() {
        List<Station> stations = terminalService.getAllStations();
        return ResponseEntity.ok(
                stations.stream().map(StationResponse::fromDomain).toList());
    }

    /** Consultar una estación por ID. */
    @GetMapping("/stations/{id}")
    public ResponseEntity<StationResponse> getStation(@PathVariable Long id) {
        Station station = terminalService.getStation(id);
        return ResponseEntity.ok(StationResponse.fromDomain(station));
    }

    /** Operación interna / consulta de conector. */
    @GetMapping("/connectors/{id}")
    public ResponseEntity<ConnectorResponse> getConnector(@PathVariable Long id) {
        Connector connector = terminalService.getConnector(id);
        return ResponseEntity.ok(ConnectorResponse.fromDomain(connector));
    }

    /** Eliminar un conector por ID. */
    @DeleteMapping("/connectors/{id}")
    @PreAuthorize("hasRole('CPO')")
    public ResponseEntity<Void> removeConnector(@PathVariable Long id) {
        terminalService.removeConnector(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
