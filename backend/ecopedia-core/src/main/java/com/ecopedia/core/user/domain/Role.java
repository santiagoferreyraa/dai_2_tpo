package com.ecopedia.core.user.domain;

/**
 * Roles del sistema Ecopedia.
 *
 * <ul>
 *   <li>{@code CONDUCTOR}: Usuario que reserva conectores y realiza cargas.
 *   <li>{@code CPO}: Operador de puntos de carga (registra estaciones y conectores).
 *   <li>{@code ADMIN}: Administrador con permisos de backoffice.
 * </ul>
 */
public enum Role {
    CONDUCTOR,
    CPO,
    ADMIN
}
