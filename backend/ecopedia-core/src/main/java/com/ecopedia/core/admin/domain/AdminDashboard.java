package com.ecopedia.core.admin.domain;

/**
 * Resumen métrico del estado general de la plataforma Ecopedia para el Backoffice de Administración (RF03 / ECO-27).
 */
public record AdminDashboard(
        UsersSummary usersSummary, StationsSummary stationsSummary, ConnectorsSummary connectorsSummary) {
    public record UsersSummary(long total, long active, long inactive, long conductors, long cpos, long admins) {}

    public record StationsSummary(long total, long active, long inactive) {}

    public record ConnectorsSummary(long total, long available, long occupied, long outOfService) {}
}
