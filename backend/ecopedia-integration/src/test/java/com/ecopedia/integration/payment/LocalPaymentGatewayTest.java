package com.ecopedia.integration.payment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.ecopedia.integration.payment.domain.CardBrand;
import com.ecopedia.integration.payment.domain.CardData;
import com.ecopedia.integration.payment.domain.TokenizedCard;
import com.ecopedia.integration.payment.gateway.LocalPaymentGateway;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * La tokenización: lo que la pasarela acepta, lo que rechaza y lo que devuelve.
 *
 * <p><b>El reloj está fijo en enero de 2026</b>, así que los casos de vencimiento están escritos con
 * fechas concretas y no caducan con el tiempo. Un test que dice "año 2030" para probar una tarjeta
 * vigente deja de probar eso en 2030.
 */
class LocalPaymentGatewayTest {

    /* Números de prueba estándar de cada marca. Pasan Luhn y no corresponden a ninguna tarjeta real. */
    private static final String VISA = "4111 1111 1111 1111";
    private static final String MASTERCARD = "5555555555554444";
    private static final String MASTERCARD_NEW_RANGE = "2223003122003222";
    private static final String AMEX = "378282246310005";

    private final Clock january2026 = Clock.fixed(Instant.parse("2026-01-15T12:00:00Z"), ZoneOffset.UTC);
    private final LocalPaymentGateway gateway = new LocalPaymentGateway(january2026);

    private CardData card(String number) {
        return new CardData(number, 9, 2029, "SANTIAGO R", null);
    }

    @Test
    @DisplayName("Devuelve marca, últimos cuatro y token, y nada más")
    void tokenizesAValidCard() {
        TokenizedCard tokenized = gateway.tokenize(card(VISA));

        assertEquals(CardBrand.VISA, tokenized.brand());
        assertEquals("1111", tokenized.lastFour());
        assertTrue(tokenized.gatewayToken().startsWith("tok_"));
    }

    @Test
    @DisplayName("El token no contiene el número de la tarjeta")
    void tokenIsNotDerivedFromTheNumber() {
        TokenizedCard tokenized = gateway.tokenize(card(VISA));

        // La garantía de RF02 en su forma más literal: el número no está en lo que se guarda.
        assertTrue(!tokenized.gatewayToken().contains("4111111111111111"));
    }

    @Test
    @DisplayName("Dos altas de la misma tarjeta dan tokens distintos")
    void issuesADifferentTokenEachTime() {
        String first = gateway.tokenize(card(VISA)).gatewayToken();
        String second = gateway.tokenize(card(VISA)).gatewayToken();

        /*
         * Es lo que hace una pasarela real, y es la razón por la que el duplicado no se detecta
         * comparando tokens. Si esto cambiara, el criterio de PaymentServiceImpl dejaría de tener
         * sentido: por eso está escrito como test y no solo como comentario.
         */
        assertTrue(!first.equals(second));
    }

    @Test
    @DisplayName("Reconoce las tres marcas por el rango del número")
    void detectsTheBrand() {
        assertEquals(CardBrand.VISA, gateway.tokenize(card(VISA)).brand());
        assertEquals(CardBrand.MASTERCARD, gateway.tokenize(card(MASTERCARD)).brand());
        assertEquals(
                CardBrand.MASTERCARD,
                gateway.tokenize(card(MASTERCARD_NEW_RANGE)).brand());
        assertEquals(CardBrand.AMEX, gateway.tokenize(card(AMEX)).brand());
    }

    @Test
    @DisplayName("Acepta el número con espacios y guiones, como se copia de la tarjeta")
    void acceptsSeparators() {
        assertEquals("1111", gateway.tokenize(card("4111-1111 1111-1111")).lastFour());
    }

    @Test
    @DisplayName("Rechaza un número que no pasa el dígito verificador")
    void rejectsATypo() {
        // Un solo dígito cambiado sobre el número válido: el caso real de error de tipeo.
        var rejected = assertThrows(IllegalArgumentException.class, () -> gateway.tokenize(card("4111111111111112")));

        assertTrue(rejected.getMessage().contains("no es válido"));
    }

    @Test
    @DisplayName("Rechaza una marca que el sistema no sabe cobrar")
    void rejectsAnUnknownBrand() {
        // Diners Club: pasa Luhn, pero no es ninguna de las tres marcas aceptadas.
        assertThrows(IllegalArgumentException.class, () -> gateway.tokenize(card("30569309025904")));
    }

    @Test
    @DisplayName("Rechaza una tarjeta vencida el mes pasado")
    void rejectsAnExpiredCard() {
        var rejected = assertThrows(
                IllegalArgumentException.class,
                () -> gateway.tokenize(new CardData(VISA, 12, 2025, "SANTIAGO R", null)));

        assertTrue(rejected.getMessage().contains("vencida"));
    }

    @Test
    @DisplayName("Acepta una tarjeta que vence este mismo mes")
    void acceptsACardExpiringThisMonth() {
        /*
         * Una tarjeta 01/26 sirve TODO enero de 2026, hasta el último día. Rechazarla el día 15
         * sería inutilizarla medio mes antes de tiempo — el error clásico de comparar contra el
         * día en vez de contra el mes.
         */
        TokenizedCard tokenized = gateway.tokenize(new CardData(VISA, 1, 2026, "SANTIAGO R", null));

        assertEquals(CardBrand.VISA, tokenized.brand());
    }

    @Test
    @DisplayName("Rechaza un número con letras")
    void rejectsNonDigits() {
        assertThrows(IllegalArgumentException.class, () -> gateway.tokenize(card("4111abcd11111111")));
    }
}
