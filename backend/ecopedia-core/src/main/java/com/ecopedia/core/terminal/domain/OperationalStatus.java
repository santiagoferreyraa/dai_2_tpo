package com.ecopedia.core.terminal.domain;

/**
 * Estado operativo de un conector (RF05).
 *
 * <p>{@code OCCUPIED} lo escribe SesionesDeCarga al habilitar y liberar; los otros dos los
 * maneja el operador desde el ABM.
 */
public enum OperationalStatus {
    AVAILABLE,
    OCCUPIED,
    OUT_OF_SERVICE
}
