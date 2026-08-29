package com.ecopedia.charging;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Artefacto desplegable {@code ecopedia-charging}.
 *
 * <p>Va a agrupar los dos componentes <b>stateful</b> del sistema:
 * {@code BookingService} (hold temporal del slot) y {@code ChargingSessionService}
 * (sesión de carga en curso).
 *
 * <p>Están juntos a propósito: aislar todo el estado conversacional en un único artefacto
 * evita tener que coordinarlo entre procesos. Ver ARQUITECTURA_ECOPEDIA.md §6.4.
 */
@SpringBootApplication
public class EcopediaChargingApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcopediaChargingApplication.class, args);
    }
}
