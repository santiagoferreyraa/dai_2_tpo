package com.ecopedia.charging.booking.service;

import com.ecopedia.charging.booking.domain.Booking;
import com.ecopedia.charging.booking.domain.BookingService;
import com.ecopedia.charging.booking.domain.ConnectorCatalog;
import com.ecopedia.charging.booking.domain.ConnectorNotBookableException;
import com.ecopedia.charging.booking.domain.ConnectorNotFoundException;
import com.ecopedia.charging.booking.domain.ConnectorSnapshot;
import com.ecopedia.charging.booking.domain.Hold;
import com.ecopedia.charging.booking.domain.InvalidBookingRequestException;
import com.ecopedia.charging.booking.domain.SlotUnavailableException;
import com.ecopedia.charging.booking.domain.TimeWindow;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Implementación del componente <i>Reservas</i>: el único stateful construido hasta ahora.
 *
 * <p><b>Dónde está el estado.</b> En {@link #holds}: las retenciones vigentes, una por intento de
 * reserva. Es un campo de instancia de un bean que crea y destruye el contenedor, <b>no</b> un
 * {@code static}: su vida es la del componente, y la del componente la decide Spring. Eso es lo
 * que pide la consigna y lo que se muestra en la demo.
 *
 * <p><b>La evidencia del ciclo de vida son los dos callbacks</b>, y cada uno deja una línea en el
 * log:
 *
 * <ul>
 *   <li>{@link #start()} con {@code @PostConstruct}: el contenedor ya inyectó todo y, antes de
 *       que llegue el primer pedido, el componente arma el reloj que vence las retenciones.
 *   <li>{@link #stop()} con {@code @PreDestroy}: al bajar el proceso, el contenedor le avisa;
 *       el componente apaga el reloj y suelta las retenciones que nadie confirmó.
 * </ul>
 *
 * <p><b>Por qué las retenciones no van a la base.</b> Duran minutos, vencen solas y no son un
 * compromiso de nadie todavía. Guardarlas sería llenar la base de reservas fantasma y obligar a
 * un proceso aparte a limpiarlas. Si el proceso se reinicia, se pierden, y está bien: el
 * conductor vuelve a elegir el slot. Lo que sí se guarda es la reserva confirmada (ECO-32).
 */
@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final ConnectorCatalog connectorCatalog;
    private final Clock clock;
    private final Duration holdTtl;

    /** El estado conversacional del componente: las retenciones vigentes, por id. */
    private final Map<UUID, Hold> holds = new ConcurrentHashMap<>();

    /**
     * Candado para "revisar si el slot está libre y retenerlo".
     *
     * <p>El mapa ya tolera accesos concurrentes, pero eso no alcanza: son DOS pasos, y si dos
     * conductores piden el mismo slot en el mismo instante, los dos pueden revisar, ver el slot
     * libre y retenerlo. Es exactamente el caso que §2.1 dice que este componente evita.
     */
    private final Object holdLock = new Object();

    /** El reloj que vence las retenciones. Lo crea {@link #start()} y lo apaga {@link #stop()}. */
    private ScheduledExecutorService expirations;

    public BookingServiceImpl(
            ConnectorCatalog connectorCatalog, Clock clock, @Value("${ecopedia.booking.hold-ttl}") Duration holdTtl) {
        this.connectorCatalog = connectorCatalog;
        this.clock = clock;
        this.holdTtl = holdTtl;
    }

    /**
     * Callback de inicialización: lo invoca el contenedor una sola vez, con las dependencias ya
     * inyectadas y antes de que el componente atienda un pedido.
     *
     * <p>El reloj se arma acá y no en el constructor porque es un recurso con ciclo de vida
     * —un hilo—, y quien lo abre tiene que ser quien sabe cuándo cerrarlo.
     */
    @PostConstruct
    void start() {
        expirations = Executors.newSingleThreadScheduledExecutor(task -> {
            Thread thread = new Thread(task, "booking-hold-expiration");
            // Daemon: si algo falla antes del @PreDestroy, este hilo no mantiene vivo el proceso.
            thread.setDaemon(true);
            return thread;
        });
        log.info(
                "BookingService iniciado por el contenedor (@PostConstruct): las retenciones vencen a los {}", holdTtl);
    }

    /**
     * Callback de destrucción: lo invoca el contenedor al cerrarse, antes de soltar el bean.
     *
     * <p>Sin esto el hilo del reloj quedaría huérfano. Y el log deja constancia de cuántas
     * retenciones se perdieron con el reinicio, que es información útil y no un error.
     */
    @PreDestroy
    void stop() {
        int pending = holds.size();
        expirations.shutdownNow();
        holds.clear();
        log.info(
                "BookingService destruido por el contenedor (@PreDestroy): se liberaron {} retenciones sin confirmar",
                pending);
    }

    @Override
    public Hold startHold(Long connectorId, TimeWindow window, Long driverId) {
        Instant now = clock.instant();
        if (window.start().isBefore(now)) {
            throw new InvalidBookingRequestException("La ventana ya empezó: las reservas son a futuro");
        }

        /*
         * El conector se consulta ANTES de tomar el candado: es un pedido de red a core y puede
         * tardar hasta el plazo del cliente. Con el candado tomado, un core lento frenaría las
         * retenciones de todos los conectores, no solo las de este.
         */
        ConnectorSnapshot connector = connectorCatalog
                .findConnector(connectorId)
                .orElseThrow(() -> new ConnectorNotFoundException(connectorId));
        if (connector.isOutOfService()) {
            throw new ConnectorNotBookableException(connectorId);
        }

        Hold hold;
        synchronized (holdLock) {
            /*
             * Una retención vencida no bloquea aunque el reloj todavía no la haya sacado del mapa:
             * el reloj es la limpieza, y la regla es la hora. ECO-33 suma acá la verificación
             * contra las reservas ya guardadas.
             */
            boolean taken = holds.values().stream()
                    .anyMatch(other -> other.connectorId().equals(connectorId)
                            && !other.isExpiredAt(now)
                            && other.window().overlaps(window));
            if (taken) {
                throw new SlotUnavailableException(connectorId);
            }

            hold = new Hold(UUID.randomUUID(), connectorId, driverId, window, now.plus(holdTtl));
            holds.put(hold.id(), hold);
        }

        expirations.schedule(() -> expire(hold.id()), holdTtl.toMillis(), TimeUnit.MILLISECONDS);
        log.info(
                "Retención {} del conector {} para el conductor {}: vence a las {}",
                hold.id(),
                connectorId,
                driverId,
                hold.expiresAt());
        return hold;
    }

    /** Lo ejecuta el reloj al cumplirse el plazo. Si ya se confirmó, no queda nada que sacar. */
    private void expire(UUID holdId) {
        Hold expired = holds.remove(holdId);
        if (expired != null) {
            log.info(
                    "Venció la retención {} del conector {}: el slot vuelve a estar libre",
                    holdId,
                    expired.connectorId());
        }
    }

    /** Cuántas retenciones hay vigentes. Para los tests: el estado se ve desde afuera sin exponerlo. */
    int activeHoldCount() {
        return holds.size();
    }

    @Override
    public Booking confirmBooking(UUID holdId, Long driverId) {
        throw new UnsupportedOperationException("Pendiente de ECO-32: confirmar una retención");
    }

    @Override
    public void cancelBooking(Long bookingId, Long driverId) {
        throw new UnsupportedOperationException("Pendiente de ECO-32: cancelar una reserva");
    }

    @Override
    public List<TimeWindow> getAvailability(Long connectorId, Instant from, Instant to) {
        throw new UnsupportedOperationException("Pendiente de ECO-33: ventanas libres de un conector");
    }
}
