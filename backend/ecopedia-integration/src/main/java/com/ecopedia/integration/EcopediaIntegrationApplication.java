package com.ecopedia.integration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Artefacto desplegable {@code ecopedia-integration}.
 *
 * <p>Agrupa los componentes que hablan con sistemas externos: {@code PaymentService}
 * (REST contra la pasarela simulada) y, más adelante, {@code PowerGridService} (SOAP
 * contra la distribuidora simulada).
 *
 * <p>Desde ECO-26 vive acá el componente de Pagos, con los medios de pago del conductor
 * (RF02) y su propio schema en la base. La pasarela todavía no corre como proceso aparte:
 * {@code PaymentGatewayPort} está implementado localmente hasta que exista.
 *
 * <p>Concentrar la salida en un borde único deja el resto del sistema sin dependencias
 * externas. Ver ARQUITECTURA_ECOPEDIA.md §3.1 y §3.2.
 */
@SpringBootApplication
public class EcopediaIntegrationApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcopediaIntegrationApplication.class, args);
    }
}
