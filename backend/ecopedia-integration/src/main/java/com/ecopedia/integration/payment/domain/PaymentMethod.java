package com.ecopedia.integration.payment.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.YearMonth;

/**
 * Una tarjeta registrada por un conductor (RF02, ECO-26).
 *
 * <p><b>Es la tarjeta sin la tarjeta.</b> Guarda marca, últimos cuatro y el token de la pasarela, y
 * no tiene campo para el número completo. Esa ausencia es el requisito, no una omisión: el número
 * viaja del formulario a la pasarela dentro de un {@link CardData} y no se persiste en ningún punto
 * del camino.
 *
 * <p><b>El dueño es un id suelto, sin relación JPA.</b> {@code driverId} apunta a la tabla de
 * usuarios, que vive en el schema de {@code ecopedia-core} — otro artefacto. Una {@code @ManyToOne}
 * obligaría a los dos servicios a compartir base para siempre, que es justo lo que la separación en
 * artefactos evita. Quien garantiza que el id sea real es la firma del token.
 */
@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "brand", nullable = false, length = 20)
    private CardBrand brand;

    /**
     * Los cuatro últimos dígitos, como texto.
     *
     * <p>Texto y no número porque los ceros a la izquierda son significativos: una tarjeta
     * terminada en 0042 guardada como entero vuelve como 42 y en pantalla queda "•••• 42".
     */
    @Column(name = "last_four", nullable = false, length = 4)
    private String lastFour;

    @Column(name = "gateway_token", nullable = false, length = 255, unique = true)
    private String gatewayToken;

    @Column(name = "expiry_month", nullable = false)
    private int expiryMonth;

    @Column(name = "expiry_year", nullable = false)
    private int expiryYear;

    @Column(name = "label", length = 60)
    private String label;

    /**
     * Baja lógica, igual que usuarios y estaciones.
     *
     * <p>Una tarjeta eliminada puede tener cobros históricos y deudas pendientes (RNF06) colgando de
     * su token. Borrar la fila dejaría esos registros apuntando a nada, y con ellos la deuda que le
     * bloquea reservar al conductor (RF02) — que es precisamente lo que no puede desaparecer porque
     * alguien borre una tarjeta.
     */
    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /**
     * Si la tarjeta ya venció.
     *
     * <p>Vive en la entidad y no en el servicio porque es una pregunta sobre la tarjeta misma, y la
     * responden sus propios datos. Vence el último día del mes indicado, que es como funcionan las
     * tarjetas: una que dice 09/26 sirve todo septiembre de 2026.
     */
    public boolean isExpired(YearMonth today) {
        return YearMonth.of(expiryYear, expiryMonth).isBefore(today);
    }

    /**
     * Si se puede usar para operar: no dada de baja y no vencida.
     *
     * <p>Es la pregunta que va a hacer Reservas cuando aplique la precondición de RF02 —"tener al
     * menos una tarjeta registrada"—, y por eso el criterio se escribe una sola vez acá y no en cada
     * consumidor. Una tarjeta activa pero vencida no cuenta: dejaría pasar la reserva para que el
     * cobro fallara después.
     */
    public boolean isUsable(YearMonth today) {
        return active && !isExpired(today);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public CardBrand getBrand() {
        return brand;
    }

    public void setBrand(CardBrand brand) {
        this.brand = brand;
    }

    public String getLastFour() {
        return lastFour;
    }

    public void setLastFour(String lastFour) {
        this.lastFour = lastFour;
    }

    public String getGatewayToken() {
        return gatewayToken;
    }

    public void setGatewayToken(String gatewayToken) {
        this.gatewayToken = gatewayToken;
    }

    public int getExpiryMonth() {
        return expiryMonth;
    }

    public void setExpiryMonth(int expiryMonth) {
        this.expiryMonth = expiryMonth;
    }

    public int getExpiryYear() {
        return expiryYear;
    }

    public void setExpiryYear(int expiryYear) {
        this.expiryYear = expiryYear;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
