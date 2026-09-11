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
    private Instant createdAt = Instant.now();

    /** Lo pide JPA. */
    protected Booking() {}

    public Booking(Long connectorId, Long driverId, TimeWindow window) {
        this.connectorId = connectorId;
        this.driverId = driverId;
        this.windowStart = window.start();
        this.windowEnd = window.end();
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

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
