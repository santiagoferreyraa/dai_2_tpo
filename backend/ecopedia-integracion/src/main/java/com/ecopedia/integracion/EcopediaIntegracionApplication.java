package com.ecopedia.integracion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Artefacto desplegable {@code ecopedia-integracion}.
 *
 * <p>Va a agrupar los componentes que hablan con sistemas externos:
 * {@code ServicioDePagos} (REST contra la pasarela simulada) y
 * {@code ServicioDeRedElectrica} (SOAP contra la distribuidora simulada).
 *
 * <p>Concentrar la salida en un borde único deja el resto del sistema sin dependencias
 * externas. Ver ARQUITECTURA_ECOPEDIA.md §3.1 y §3.2.
 */
@SpringBootApplication
public class EcopediaIntegracionApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcopediaIntegracionApplication.class, args);
    }
}
