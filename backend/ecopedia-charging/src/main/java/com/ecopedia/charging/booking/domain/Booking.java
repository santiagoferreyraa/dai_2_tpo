package com.ecopedia.charging.booking.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Una reserva confirmada: el conector queda bloqueado para el resto durante su ventana (RF08).
 *
 * <p>Es lo que queda de una {@link Hold} cuando el conductor confirma. A diferencia de la
 * retención, esto sí es dominio persistido y no estado conversacional: sobrevive a un reinicio
 * del proceso, y tiene que sobrevivir, porque el conductor ya se comprometió.
 *
 * <p>{@code connectorId} y {@code driverId} son identificadores sueltos y no relaciones JPA: el
 * conector y el usuario viven en {@code ecopedia-core}, otro artefacto. Ver la migración.
 */
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "connector_id", nullable = false)
    private Long connectorId;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Column(name = "window_start", nullable = false)
    private Instant windowStart;

    @Column(name = "window_end", nullable = false)
    private Instant windowEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Lo pide JPA. */
    protected Booking() {}

    /**
     * El instante de creación entra por parámetro y no sale de {@code Instant.now()}: el resto
     * del componente decide todo contra el {@code Clock} que le inyecta el contenedor, y una
     * fecha que se toma por su cuenta es la única que un test no puede fijar.
     */
    public Booking(Long connectorId, Long driverId, TimeWindow window, Instant createdAt) {
        this.connectorId = connectorId;
        this.driverId = driverId;
        this.windowStart = window.start();
        this.windowEnd = window.end();
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public Long getConnectorId() {
        return connectorId;
    }

    public Long getDriverId() {
        return driverId;
    }

    public TimeWindow getWindow() {
        return new TimeWindow(windowStart, windowEnd);
    }

    public BookingStatus getStatus() {
        return status;
    }

    /**
     * Cancela la reserva y con eso libera la ventana: el cruce solo mira las {@code CONFIRMED},
     * así que a partir de acá el slot se puede volver a reservar.
     *
     * <p>Es un método con nombre y no un {@code setStatus} abierto porque no todo cambio de
     * estado es válido desde cualquier otro: la incomparecencia y el consumo de la reserva (RF09,
     * RF11) van a entrar como métodos propios, cada uno con su condición.
     */
    public void cancel() {
        this.status = BookingStatus.CANCELLED;
    }

    public boolean isCancelled() {
        return status == BookingStatus.CANCELLED;
    }

    public boolean belongsTo(Long driverId) {
        return this.driverId.equals(driverId);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
