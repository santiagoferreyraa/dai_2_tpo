package com.ecopedia.core.terminal.domain;

/**
 * Estándar físico del conector, que es lo que determina con qué vehículos es compatible.
 *
 * <p>Son los tres que nombra RF05. Se guardan como texto en la base, no como ordinal:
 * agregar un estándar nuevo no debe correr el significado de los que ya están guardados.
 */
public enum ConnectorType {
    CCS2,
    CHADEMO,
    TYPE_2
}
