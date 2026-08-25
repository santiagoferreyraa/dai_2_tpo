package com.ecopedia.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Artefacto desplegable {@code ecopedia-core}.
 *
 * <p>Va a agrupar los componentes de negocio stateless del sistema:
 * {@code ServicioDeTerminales}, {@code ServicioDeUsuarios} y {@code ServicioDeTarificacion}.
 *
 * <p>Cada componente vivirá en su propio paquete, con su interfaz explícita y sus tres capas
 * separadas (presentación / negocio / datos).
 */
@SpringBootApplication
public class EcopediaCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcopediaCoreApplication.class, args);
    }
}
