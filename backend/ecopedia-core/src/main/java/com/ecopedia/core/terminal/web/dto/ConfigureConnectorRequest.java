package com.ecopedia.core.terminal.web.dto;

import com.ecopedia.core.terminal.domain.ConnectorType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ConfigureConnectorRequest(
        @NotNull(message = "El tipo de conector es obligatorio") ConnectorType connectorType,
        @NotNull(message = "La potencia máxima es obligatoria") BigDecimal maxPowerKw) {}
