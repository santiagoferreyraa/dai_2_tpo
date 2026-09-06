package com.ecopedia.core.user.domain;

/**
 * Token de acceso resultante de una autenticación exitosa.
 */
public record AuthToken(String token, Long userId, String email, Role role, long expiresInSeconds) {}
