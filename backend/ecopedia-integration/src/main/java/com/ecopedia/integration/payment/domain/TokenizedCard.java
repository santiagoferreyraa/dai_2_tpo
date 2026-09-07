package com.ecopedia.integration.payment.domain;

/**
 * Lo que la pasarela devuelve a cambio de una tarjeta: exactamente lo que se puede guardar.
 *
 * <p>Los tres campos son los tres que nombra RF02, y no es casualidad que el tipo tenga esta forma
 * y no otra: si la respuesta de la pasarela se modelara como un objeto genérico con el número
 * adentro, guardar de más sería un descuido posible. Con este record, guardar el número no es que
 * esté prohibido — es que no está.
 *
 * @param brand marca deducida del número por la pasarela.
 * @param lastFour últimos cuatro dígitos, para que el conductor reconozca cuál es cuál.
 * @param gatewayToken el sustituto del número. Es con esto que se cobra de acá en adelante.
 */
public record TokenizedCard(CardBrand brand, String lastFour, String gatewayToken) {}
