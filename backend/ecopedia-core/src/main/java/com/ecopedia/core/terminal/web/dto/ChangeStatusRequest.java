package com.ecopedia.core.terminal.web.dto;

import com.ecopedia.core.terminal.domain.OperationalStatus;
import jakarta.validation.constraints.NotNull;

public record ChangeStatusRequest(
        @NotNull(message = "El estado operativo es obligatorio") OperationalStatus operationalStatus) {}
