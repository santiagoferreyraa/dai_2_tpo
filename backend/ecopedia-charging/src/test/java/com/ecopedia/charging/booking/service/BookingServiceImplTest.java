package com.ecopedia.charging.booking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.ecopedia.charging.booking.domain.ConnectorCatalog;
import com.ecopedia.charging.booking.domain.ConnectorNotBookableException;
import com.ecopedia.charging.booking.domain.ConnectorNotFoundException;
import com.ecopedia.charging.booking.domain.ConnectorSnapshot;
import com.ecopedia.charging.booking.domain.Hold;
import com.ecopedia.charging.booking.domain.InvalidBookingRequestException;
import com.ecopedia.charging.booking.domain.SlotUnavailableException;
import com.ecopedia.charging.booking.domain.TimeWindow;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * El estado de Reservas y su ciclo de vida (ECO-31), probados sin levantar Spring.
 *
 * <p>Los callbacks se invocan a mano —{@code start()} y {@code stop()}— en el orden en que los
 * invoca el contenedor. Así cada prueba dice explícitamente en qué momento de la vida del
 * componente está, y la que prueba el vencimiento no depende de cuánto tarde en arrancar un
 * contexto entero.
 */
class BookingServiceImplTest {

    private static final Long CONNECTOR = 7L;
    private static final Long DRIVER = 42L;
    private static final Long OTHER_DRIVER = 43L;

    /** Un conector que existe y está libre. */
    private static final ConnectorCatalog AVAILABLE = id -> Optional.of(new ConnectorSnapshot(id, 1L, "AVAILABLE"));

    private BookingServiceImpl service;

    @AfterEach
    void destroy() {
        if (service != null) {
            service.stop();
        }
    }

    /** El componente recién inicializado por el "contenedor", con el plazo de retención pedido. */
    private BookingServiceImpl started(ConnectorCatalog catalog, Duration holdTtl) {
        service = new BookingServiceImpl(catalog, Clock.systemUTC(), holdTtl);
        service.start();
        return service;
    }

    /** Una ventana de una hora que empieza dentro de {@code hoursFromNow} horas. */
    private static TimeWindow windowIn(long hoursFromNow) {
        Instant start = Instant.now().plus(Duration.ofHours(hoursFromNow));
        return new TimeWindow(start, start.plus(Duration.ofHours(1)));
    }

    @Test
    @DisplayName("La retención vence sola y el slot vuelve a quedar libre")
    void holdExpiresOnItsOwn() throws InterruptedException {
        started(AVAILABLE, Duration.ofMillis(150));
        TimeWindow window = windowIn(2);

        service.startHold(CONNECTOR, window, DRIVER);
        assertThat(service.activeHoldCount()).isEqualTo(1);

        // El vencimiento lo dispara el reloj del componente, no la prueba: se espera a que pase.
        long deadline = System.currentTimeMillis() + 3_000;
        while (service.activeHoldCount() > 0 && System.currentTimeMillis() < deadline) {
            Thread.sleep(25);
        }
        assertThat(service.activeHoldCount()).isZero();

        // La prueba de fondo: otro conductor puede tomar exactamente el mismo slot.
        Hold retaken = service.startHold(CONNECTOR, window, OTHER_DRIVER);
        assertThat(retaken.driverId()).isEqualTo(OTHER_DRIVER);
    }

    @Test
    @DisplayName("No se puede retener dos veces una ventana que se cruza, en el mismo conector")
    void rejectsOverlappingHoldOnTheSameConnector() {
        started(AVAILABLE, Duration.ofMinutes(10));
        TimeWindow window = windowIn(2);
        service.startHold(CONNECTOR, window, DRIVER);

        TimeWindow halfOverlapping = new TimeWindow(
                window.start().plus(Duration.ofMinutes(30)), window.end().plus(Duration.ofMinutes(30)));

        assertThatThrownBy(() -> service.startHold(CONNECTOR, window, OTHER_DRIVER))
                .isInstanceOf(SlotUnavailableException.class);
        assertThatThrownBy(() -> service.startHold(CONNECTOR, halfOverlapping, OTHER_DRIVER))
                .isInstanceOf(SlotUnavailableException.class);
    }

    /*
     * La contracara de la anterior: la regla no puede ser tan gruesa que bloquee lo que no se
     * pisa. Un turno pegado al otro y el mismo turno en otro conector tienen que poder retenerse.
     */
    @Test
    @DisplayName("Una ventana pegada, o la misma en otro conector, sí se puede retener")
    void allowsAdjacentWindowsAndOtherConnectors() {
        started(AVAILABLE, Duration.ofMinutes(10));
        TimeWindow window = windowIn(2);
        service.startHold(CONNECTOR, window, DRIVER);

        TimeWindow rightAfter = new TimeWindow(window.end(), window.end().plus(Duration.ofHours(1)));

        service.startHold(CONNECTOR, rightAfter, OTHER_DRIVER);
        service.startHold(CONNECTOR + 1, window, OTHER_DRIVER);
        assertThat(service.activeHoldCount()).isEqualTo(3);
    }

    @Test
    @DisplayName("Al destruirse el componente (@PreDestroy) se liberan las retenciones")
    void destroyReleasesPendingHolds() {
        started(AVAILABLE, Duration.ofMinutes(10));
        service.startHold(CONNECTOR, windowIn(2), DRIVER);
        service.startHold(CONNECTOR, windowIn(4), DRIVER);

        service.stop();

        assertThat(service.activeHoldCount()).isZero();
        service = null; // ya destruido: el @AfterEach no lo vuelve a destruir
    }

    @Test
    @DisplayName("Un conector fuera de servicio no se retiene")
    void rejectsOutOfServiceConnector() {
        started(id -> Optional.of(new ConnectorSnapshot(id, 1L, "OUT_OF_SERVICE")), Duration.ofMinutes(10));

        assertThatThrownBy(() -> service.startHold(CONNECTOR, windowIn(2), DRIVER))
                .isInstanceOf(ConnectorNotBookableException.class);
        assertThat(service.activeHoldCount()).isZero();
    }

    /* Ocupado AHORA no importa: la reserva es para más tarde, y quien carga ya se habrá ido. */
    @Test
    @DisplayName("Un conector ocupado ahora sí se puede retener para más tarde")
    void allowsCurrentlyOccupiedConnector() {
        started(id -> Optional.of(new ConnectorSnapshot(id, 1L, "OCCUPIED")), Duration.ofMinutes(10));

        service.startHold(CONNECTOR, windowIn(2), DRIVER);
        assertThat(service.activeHoldCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("Un conector que no existe se rechaza")
    void rejectsUnknownConnector() {
        started(id -> Optional.empty(), Duration.ofMinutes(10));

        assertThatThrownBy(() -> service.startHold(CONNECTOR, windowIn(2), DRIVER))
                .isInstanceOf(ConnectorNotFoundException.class);
    }

    @Test
    @DisplayName("Una ventana que ya empezó se rechaza")
    void rejectsWindowInThePast() {
        started(AVAILABLE, Duration.ofMinutes(10));
        Instant start = Instant.now().minus(Duration.ofMinutes(5));

        assertThatThrownBy(() ->
                        service.startHold(CONNECTOR, new TimeWindow(start, start.plus(Duration.ofHours(1))), DRIVER))
                .isInstanceOf(InvalidBookingRequestException.class);
    }
}
