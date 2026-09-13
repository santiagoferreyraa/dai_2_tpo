package com.ecopedia.core.user.web.dto;

import com.ecopedia.core.user.domain.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleRequest(
        @NotNull(message = "El rol es obligatorio") Role role) {}
