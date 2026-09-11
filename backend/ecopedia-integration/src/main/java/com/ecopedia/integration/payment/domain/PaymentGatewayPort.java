package com.ecopedia.integration.payment.domain;

/**
 * Puerto de salida hacia la pasarela de pagos.
 *
 * <p><b>Es el puerto que ARQUITECTURA §2.6 llama {@code PaymentGatewayPort}</b>, y está declarado
 * antes de que exista la pasarela a propósito. El componente de Pagos habla con este contrato y
 * nunca con un cliente HTTP: el día que se levante {@code pasarela-simulada} como proceso aparte
 * (RNF04), entra un {@code PaymentGatewayRestClient} que lo implementa y no cambia una línea de
 * {@code PaymentServiceImpl} ni de la capa de datos.
 *
 * <p><b>Hoy lo implementa {@code LocalPaymentGateway}, que no sale a la red.</b> Es una decisión
 * tomada para ECO-26, no una deuda escondida: el ticket pide el ABM de medios de pago, y lo que
 * ese ABM necesita de la pasarela es un token. Levantar el proceso externo es el trabajo de otro
 * ticket, y meterlo acá habría mezclado dos entregas en una.
 *
 * <p>De este puerto cuelgan más adelante {@code chargeDeposit}, {@code validateCard},
 * {@code chargeConsumption} y {@code refund}. Se agregan cuando haya quién las llame: declararlas
 * ahora sería llenar la interfaz de métodos sin implementación real ni consumidor.
 */
public interface PaymentGatewayPort {

    /**
     * Cambia el número de una tarjeta por un token que la representa.
     *
     * <p>Es la operación que hace posible RF02: a partir de acá el sistema opera con el token y el
     * número deja de existir para nosotros. La pasarela es además la que valida —número, marca,
     * vencimiento—, porque es la única que puede decir si esa tarjeta es cobrable de verdad.
     *
     * @throws IllegalArgumentException si la pasarela rechaza la tarjeta. Es la misma excepción con
     *     la que el resto del sistema señala "el dato que llegó no sirve", y el manejador de la
     *     capa web la traduce a un 400 con el motivo puesto para que el conductor lo lea.
     */
    TokenizedCard tokenize(CardData card);
}
