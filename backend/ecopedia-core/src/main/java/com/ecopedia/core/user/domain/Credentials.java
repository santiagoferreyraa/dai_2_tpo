package com.ecopedia.core.user.domain;

/**
 * Credenciales para autenticación de usuario (ECO-24).
 */
public record Credentials(String email, String rawPassword) {}
