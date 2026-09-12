package com.ecopedia.core.admin.web.dto;

import com.ecopedia.core.admin.domain.AdminDashboard;

public record AdminDashboardResponse(
        AdminDashboard.UsersSummary users,
        AdminDashboard.StationsSummary stations,
        AdminDashboard.ConnectorsSummary connectors) {
    public static AdminDashboardResponse fromDomain(AdminDashboard dashboard) {
        return new AdminDashboardResponse(
                dashboard.usersSummary(), dashboard.stationsSummary(), dashboard.connectorsSummary());
    }
}
