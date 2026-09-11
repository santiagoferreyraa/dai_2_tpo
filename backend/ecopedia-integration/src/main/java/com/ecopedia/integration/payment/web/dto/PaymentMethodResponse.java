package com.ecopedia.integration.payment.web.dto;

import com.ecopedia.integration.payment.domain.CardBrand;
import com.ecopedia.integration.payment.domain.PaymentMethod;
import java.time.YearMonth;

/**
 * Una tarjeta registrada, tal como la ve el conductor.
 *
 * <p><b>No lleva el token, y esa ausencia es deliberada.</b> El token es el sustituto del número:
 * quien lo tiene puede cobrar. No hay nada que la pantalla pueda hacer con él —para eliminar
 * alcanza el id—, así que mandarlo sería exponer la credencial de cobro en cada carga de la
 * pantalla, en el historial del navegador y en cualquier proxy del camino, a cambio de nada.
 *
 * <p>El {@code driverId} tampoco viaja: el conductor ya sabe quién es, y estas son sus tarjetas.
 *
 * @param expired si ya venció. Se calcula en el servidor a propósito: si la pantalla lo dedujera
 *     comparando contra la fecha de la máquina del usuario, un reloj mal puesto mostraría vigente
 *     una tarjeta que el backend va a rechazar, o al revés.
 */
public record PaymentMethodResponse(
        Long id, CardBrand brand, String lastFour, int expiryMonth, int expiryYear, String label, boolean expired) {

    public static PaymentMethodResponse fromDomain(PaymentMethod card, YearMonth today) {
        return new PaymentMethodResponse(
                card.getId(),
                card.getBrand(),
                card.getLastFour(),
                card.getExpiryMonth(),
                card.getExpiryYear(),
                card.getLabel(),
                card.isExpired(today));
    }
}
