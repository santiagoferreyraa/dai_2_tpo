package com.ecopedia.core.terminal.web.dto;

import com.ecopedia.core.terminal.domain.Connector;
import com.ecopedia.core.terminal.domain.ConnectorType;
import com.ecopedia.core.terminal.domain.OperationalStatus;
import java.math.BigDecimal;

public record ConnectorResponse(
        Long id,
        Long stationId,
        ConnectorType connectorType,
        BigDecimal maxPowerKw,
        OperationalStatus operationalStatus) {
    public static ConnectorResponse fromDomain(Connector connector) {
        return new ConnectorResponse(
                connector.getId(),
                connector.getStation() != null ? connector.getStation().getId() : null,
                connector.getConnectorType(),
                connector.getMaxPowerKw(),
                connector.getOperationalStatus());
    }
}
