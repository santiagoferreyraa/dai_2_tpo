package com.ecopedia.integration.payment.domain;

import java.util.List;

/**
 * Interfaz pública del componente {@code Pagos} (stateless).
 *
 * <p>Cubre por ahora las tres operaciones de RF02 que pide ECO-26: registrar, consultar y eliminar
 * los medios de pago del conductor. Las de cobro —{@code chargeDeposit}, {@code validateCard},
 * {@code chargeConsumption}, {@code refund}, {@code getOutstandingDebt}— están en el contrato de
 * ARQUITECTURA §2.6 y se agregan cuando existan sus consumidores: Reservas y SesionesDeCarga.
 * Declararlas ahora sería llenar la interfaz de métodos que nadie llama y que ninguna prueba cubre.
 *
 * <p><b>Sobre la precondición de RF02.</b> "Tener al menos una tarjeta registrada es precondición de
 * toda transacción" es una regla que se aplica al reservar y al iniciar una carga, no al registrar
 * una tarjeta. Este componente la hace verificable —{@link #listCards} y
 * {@link PaymentMethod#isUsable}— y quien la exige es Reservas, en ECO-32. Meter la exigencia acá
 * sería ponerla en el único lugar del sistema donde no hay nada que exigir.
 */
public interface PaymentService {

    /**
     * Registra una tarjeta para un conductor y devuelve lo que quedó guardado.
     *
     * <p>El número va a la pasarela y no vuelve: lo que se persiste es marca, últimos cuatro y
     * token.
     */
    PaymentMethod registerCard(Long driverId, CardData data);

    /** Las tarjetas vigentes del conductor. */
    List<PaymentMethod> listCards(Long driverId);

    /**
     * Da de baja una tarjeta del conductor.
     *
     * <p><b>Recibe el dueño además del id de la tarjeta, y el contrato del documento no.</b> Ahí la
     * operación es {@code removeCard(cardId)} con el rol anotado como "DRIVER dueño"; acá el dueño
     * viaja como parámetro para que la comprobación viva en el negocio y no en el controlador. La
     * diferencia importa: {@code @PreAuthorize} sabe decir "es un conductor", pero no "es el
     * conductor de ESTA tarjeta", porque para saberlo hay que ir a buscarla. Dejar esa verificación
     * en la capa web sería poner una regla de dominio donde no se la puede probar sin levantar HTTP.
     */
    void removeCard(Long driverId, Long cardId);
}
