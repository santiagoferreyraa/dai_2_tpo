package com.ecopedia.core.tariff.web;

import com.ecopedia.core.tariff.domain.TariffScheme;
import com.ecopedia.core.tariff.domain.TariffService;
import com.ecopedia.core.tariff.web.dto.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tariffs")
public class TariffController {

    private final TariffService tariffService;

    public TariffController(TariffService tariffService) {
        this.tariffService = tariffService;
    }

    /** RF06 / ECO-29: Definir esquema tarifario de un conector (Solo CPO o ADMIN). */
    @PostMapping
    @PreAuthorize("hasRole('CPO') or hasRole('ADMIN')")
    public ResponseEntity<TariffSchemeResponse> defineScheme(@Valid @RequestBody TariffSchemeRequest request) {
        TariffScheme scheme = tariffService.defineScheme(request.toDomainData());
        return ResponseEntity.status(HttpStatus.CREATED).body(TariffSchemeResponse.fromDomain(scheme));
    }

    /** RF06: Consultar esquema tarifario vigente de un conector. */
    @GetMapping("/connector/{connectorId}")
    public ResponseEntity<TariffSchemeResponse> getScheme(@PathVariable Long connectorId) {
        TariffScheme scheme = tariffService.getSchemeForConnector(connectorId);
        return ResponseEntity.ok(TariffSchemeResponse.fromDomain(scheme));
    }

    /** RF06: Estimar importe proyectado para una reserva/carga. */
    @GetMapping("/estimate")
    public ResponseEntity<EstimateCostResponse> estimateCost(
            @RequestParam Long connectorId, @RequestParam BigDecimal estimatedKwh) {

        BigDecimal deposit = tariffService.calculateDeposit(connectorId);
        BigDecimal estimatedCost = tariffService.estimateCost(connectorId, estimatedKwh, LocalDateTime.now());

        return ResponseEntity.ok(new EstimateCostResponse(connectorId, estimatedKwh, deposit, estimatedCost));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
