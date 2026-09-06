package com.ecopedia.core.user.domain;

/**
 * Datos requeridos para registrar un usuario nuevo en el sistema (ECO-24).
 */
public record RegistrationData(String email, String rawPassword, String fullName, Role role) {}
