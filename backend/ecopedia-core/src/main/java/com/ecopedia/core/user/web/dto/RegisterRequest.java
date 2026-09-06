package com.ecopedia.core.user.web.dto;

import com.ecopedia.core.user.domain.RegistrationData;
import com.ecopedia.core.user.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El email es obligatorio") @Email(message = "Formato de email inválido") String email,
        @NotBlank(message = "La contraseña es obligatoria")
                @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
                String password,
        @NotBlank(message = "El nombre completo es obligatorio") String fullName,
        Role role) {
    public RegistrationData toDomainData() {
        return new RegistrationData(email, password, fullName, role != null ? role : Role.CONDUCTOR);
    }
}
