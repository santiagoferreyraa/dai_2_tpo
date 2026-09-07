package com.ecopedia.integration.payment.gateway;

import com.ecopedia.integration.payment.domain.CardBrand;
import com.ecopedia.integration.payment.domain.CardData;
import com.ecopedia.integration.payment.domain.PaymentGatewayPort;
import com.ecopedia.integration.payment.domain.TokenizedCard;
import java.time.Clock;
import java.time.YearMonth;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * Implementación de {@link PaymentGatewayPort} que resuelve la tokenización sin salir a la red.
 *
 * <p><b>Es un reemplazo declarado de la pasarela, no un atajo.</b> ECO-26 pide el ABM de medios de
 * pago; lo que ese ABM necesita del mundo exterior es un token a cambio de un número. Levantar
 * {@code pasarela-simulada} como proceso REST aparte es lo que pide RNF04 y es trabajo de otro
 * ticket. Cuando exista, entra un {@code PaymentGatewayRestClient} implementando este mismo puerto
 * y esta clase se borra sin tocar nada más: ni el servicio, ni la entidad, ni la pantalla.
 *
 * <p><b>Valida como validaría la de verdad</b>, y eso sí es importante que esté desde ahora. Si
 * aceptara cualquier cosa, el día que entre la pasarela real aparecerían de golpe rechazos que el
 * frontend nunca vio y que nadie modeló. Acá se verifica lo mismo que verifica cualquier pasarela
 * antes de tokenizar: que el número tenga forma de número de tarjeta, que pase el dígito
 * verificador y que la tarjeta no esté vencida.
 *
 * <p><b>El token es aleatorio, no derivado del número.</b> Un token calculado a partir del PAN es
 * el PAN otra vez, disfrazado: quien tenga la tabla de tokens y la fórmula recupera las tarjetas.
 * Las pasarelas reales emiten un identificador opaco y sin relación con el número, y esta hace lo
 * mismo. Tiene una consecuencia práctica que se ve en {@code PaymentServiceImpl}: dos altas de la
 * misma tarjeta dan tokens distintos, así que el duplicado no se detecta comparando tokens.
 */
@Component
public class LocalPaymentGateway implements PaymentGatewayPort {

    /* Los límites que abarcan a las tres marcas aceptadas: AMEX tiene 15 dígitos y VISA hasta 19. */
    private static final int MINIMUM_DIGITS = 13;
    private static final int MAXIMUM_DIGITS = 19;

    private final Clock clock;

    public LocalPaymentGateway(Clock clock) {
        this.clock = clock;
    }

    @Override
    public TokenizedCard tokenize(CardData card) {
        String digits = digitsOf(card.number());

        if (digits.length() < MINIMUM_DIGITS || digits.length() > MAXIMUM_DIGITS) {
            throw new IllegalArgumentException("El número de tarjeta no tiene la cantidad de dígitos esperada");
        }
        if (!passesLuhn(digits)) {
            // El mensaje habla de un error de tipeo y no de "checksum": es lo que de verdad pasó
            // el 99% de las veces, y es lo que el conductor puede hacer algo para corregir.
            throw new IllegalArgumentException("El número de tarjeta no es válido. Revisá que esté bien copiado");
        }

        CardBrand brand = brandOf(digits);
        requireNotExpired(card);

        return new TokenizedCard(brand, digits.substring(digits.length() - 4), "tok_" + UUID.randomUUID());
    }

    /** Saca espacios y guiones, que es como la gente copia el número de la tarjeta física. */
    private String digitsOf(String number) {
        if (number == null) throw new IllegalArgumentException("Falta el número de tarjeta");

        String digits = number.replaceAll("[\\s-]", "");
        if (!digits.matches("\\d+")) {
            throw new IllegalArgumentException("El número de tarjeta solo puede tener dígitos");
        }
        return digits;
    }

    /**
     * El algoritmo de Luhn: el dígito verificador que llevan todas las tarjetas.
     *
     * <p>Atrapa el error de tipeo y la transposición de dos dígitos, que es de lejos lo que más pasa
     * al copiar dieciséis números a mano. No dice nada sobre si la tarjeta existe o tiene fondos:
     * eso solo lo sabe el emisor.
     */
    private boolean passesLuhn(String digits) {
        int sum = 0;
        boolean doubling = false;

        for (int position = digits.length() - 1; position >= 0; position--) {
            int digit = digits.charAt(position) - '0';

            if (doubling) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }

            sum += digit;
            doubling = !doubling;
        }

        return sum % 10 == 0;
    }

    /**
     * Deduce la marca del número, como hace la pasarela.
     *
     * <p>Una marca que no reconocemos se rechaza en vez de guardarse como "otra": una tarjeta
     * registrada de una marca que el sistema no sabe cobrar es una reserva que va a fallar más
     * adelante, cuando ya haya un conector bloqueado. Mejor decirlo en el alta.
     */
    private CardBrand brandOf(String digits) {
        int firstTwo = Integer.parseInt(digits.substring(0, 2));
        int firstFour = Integer.parseInt(digits.substring(0, 4));

        if (digits.startsWith("4")) return CardBrand.VISA;
        if (firstTwo == 34 || firstTwo == 37) return CardBrand.AMEX;
        if (firstTwo >= 51 && firstTwo <= 55) return CardBrand.MASTERCARD;
        if (firstFour >= 2221 && firstFour <= 2720) return CardBrand.MASTERCARD;

        throw new IllegalArgumentException("Por ahora solo se aceptan tarjetas VISA, Mastercard y American Express");
    }

    /**
     * Rechaza una tarjeta ya vencida.
     *
     * <p>Vence el último día del mes impreso, así que una 09/26 sirve todo septiembre de 2026: la
     * comparación es entre meses, no entre días.
     */
    private void requireNotExpired(CardData card) {
        if (card.expiryMonth() < 1 || card.expiryMonth() > 12) {
            throw new IllegalArgumentException("El mes de vencimiento tiene que estar entre 1 y 12");
        }

        YearMonth expiry = YearMonth.of(card.expiryYear(), card.expiryMonth());
        if (expiry.isBefore(YearMonth.now(clock))) {
            throw new IllegalArgumentException("La tarjeta está vencida");
        }
    }
}
