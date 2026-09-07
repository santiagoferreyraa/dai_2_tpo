package com.ecopedia.integration.payment.domain;

/**
 * Marca de la tarjeta, una de las tres cosas que el sistema sí guarda (RF02).
 *
 * <p>No la elige el conductor en un desplegable: la deduce la pasarela del número, que es quien
 * tiene la tabla de rangos. Pedirla en el formulario sería aceptar que alguien cargue una VISA
 * diciendo que es AMEX, y dejar el dato guardado en desacuerdo con el token que lo acompaña.
 */
public enum CardBrand {
    VISA,
    MASTERCARD,
    AMEX
}
