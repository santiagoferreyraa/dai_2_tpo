package com.ecopedia.integration.payment.domain;

/**
 * Los datos de una tarjeta tal como los escribe el conductor, camino a la pasarela.
 *
 * <p><b>Este record es lo más cerca que el número completo llega del sistema, y no se queda.</b>
 * Entra por el controlador, se lo pasa a {@link PaymentGatewayPort} y ahí termina su vida: lo que
 * vuelve es un {@link TokenizedCard} con marca, últimos cuatro y token, y eso es lo único que se
 * persiste (RF02). No existe entidad, columna ni DTO de respuesta que tenga el número.
 *
 * <p><b>Que sea un objeto de dominio y no el DTO web tiene que ver con eso.</b> El DTO se
 * serializa, se loguea y aparece en trazas; este record no sale de la llamada. La frontera está
 * puesta a propósito en el borde de la capa de presentación.
 *
 * @param number número completo. No se guarda en ninguna parte.
 * @param expiryMonth mes de vencimiento, 1 a 12.
 * @param expiryYear año de vencimiento de cuatro dígitos.
 * @param holderName nombre impreso en la tarjeta. Tampoco se guarda: lo necesita la pasarela para
 *     autorizar, y para mostrar en pantalla ya está el nombre del usuario.
 * @param label etiqueta que le pone el conductor. Opcional, y lo único de acá que es nuestro.
 */
public record CardData(String number, int expiryMonth, int expiryYear, String holderName, String label) {

    /**
     * Oculta el número en cualquier log o traza.
     *
     * <p>No es paranoia: basta un {@code log.debug("registrando {}", data)} escrito de apuro, o un
     * stack trace de Spring que incluya los argumentos, para que el número completo termine en un
     * archivo de texto. Los records generan un {@code toString()} con todos los campos, así que
     * hay que taparlo a mano — y este es el único lugar donde se puede hacer una vez.
     */
    @Override
    public String toString() {
        return "CardData[number=****, expiry=" + expiryMonth + "/" + expiryYear + "]";
    }
}
