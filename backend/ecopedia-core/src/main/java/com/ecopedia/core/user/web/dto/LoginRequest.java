package com.ecopedia.core.user.web.dto;

import com.ecopedia.core.user.domain.Credentials;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "El email es obligatorio") @Email(message = "Formato de email inválido") String email,
        @NotBlank(message = "La contraseña es obligatoria") String password) {
    public Credentials toDomainCredentials() {
        return new Credentials(email, password);
    }
}
