package com.ecopedia.charging.security;

/**
 * Quién hizo el pedido, tal como lo dice el token.
 *
 * <p>Es el principal que el filtro deja en el contexto de seguridad. A diferencia de core, que
 * guarda solo el mail, acá hace falta el id: las retenciones y las reservas se atan al conductor
 * por su id, y este artefacto no tiene la tabla de usuarios para buscarlo por mail.
 *
 * <p>El rol viaja como texto ({@code CONDUCTOR}, {@code CPO}, {@code ADMIN}) y no como enum:
 * el enum es de core, y copiarlo acá sería tener dos definiciones del mismo dato.
 */
public record AuthenticatedUser(Long id, String email, String role) {}
