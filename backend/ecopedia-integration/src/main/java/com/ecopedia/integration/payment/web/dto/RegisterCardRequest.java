package com.ecopedia.integration.payment.web.dto;

import com.ecopedia.integration.payment.domain.CardData;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Los datos que manda el formulario de alta de tarjeta (RF02).
 *
 * <p><b>La marca no se pide y el rol tampoco existe acá</b>: la marca la deduce la pasarela del
 * número, que es quien tiene la tabla de rangos. Pedirla sería aceptar que alguien cargue una VISA
 * declarándola AMEX y guardar un dato en desacuerdo con el token que lo acompaña.
 *
 * <p><b>El conductor dueño tampoco se pide</b>, y eso sí es una regla de seguridad. Si el id del
 * dueño viniera en el cuerpo, cualquiera podría registrarle una tarjeta a otro cambiando un número
 * en la petición. Sale del token, que es lo único que el cliente no puede falsificar.
 *
 * <p><b>Las validaciones de acá son de forma, no de validez.</b> Comprueban que el cuerpo tenga
 * sentido antes de gastar una llamada a la pasarela; quien dice si la tarjeta sirve de verdad
 * —dígito verificador, marca reconocida, vencimiento— es la pasarela, en {@code PaymentGatewayPort}.
 * Duplicar esas reglas acá crearía dos definiciones de "tarjeta válida" que se van a desincronizar.
 */
public record RegisterCardRequest(
        @NotBlank(message = "El número de tarjeta es obligatorio")
                @Size(min = 13, max = 25, message = "El número de tarjeta no tiene la cantidad de dígitos esperada")
                String number,
        @Min(value = 1, message = "El mes de vencimiento tiene que estar entre 1 y 12")
                @Max(value = 12, message = "El mes de vencimiento tiene que estar entre 1 y 12")
                int expiryMonth,
        /*
         * El año se pide de cuatro dígitos aunque la tarjeta lo imprima con dos. Con dos, "30" hay
         * que interpretarlo, y la regla que lo interpreta deja de valer sola en algún momento. El
         * frontend hace la cuenta una vez, al enviar.
         */
        @Min(value = 2000, message = "El año de vencimiento tiene que tener cuatro dígitos")
                @Max(value = 2099, message = "El año de vencimiento tiene que tener cuatro dígitos")
                int expiryYear,
        @NotBlank(message = "El nombre del titular es obligatorio")
                @Size(max = 120, message = "El nombre del titular es demasiado largo")
                String holderName,
        @Size(max = 60, message = "La etiqueta no puede tener más de 60 caracteres") String label) {

    public CardData toDomainData() {
        return new CardData(number, expiryMonth, expiryYear, holderName, label);
    }

    /**
     * Tapa el número en logs y trazas, igual que {@code CardData}.
     *
     * <p>Acá hace todavía más falta que allá: este record es el que Spring deserializa, el que
     * aparece en el mensaje de una {@code MethodArgumentNotValidException} y el que termina en un
     * stack trace si algo falla durante el binding. Sin este {@code toString()}, un error de
     * validación puede dejar el número completo escrito en el log del servidor.
     */
    @Override
    public String toString() {
        return "RegisterCardRequest[number=****, expiry=" + expiryMonth + "/" + expiryYear + "]";
    }
}
