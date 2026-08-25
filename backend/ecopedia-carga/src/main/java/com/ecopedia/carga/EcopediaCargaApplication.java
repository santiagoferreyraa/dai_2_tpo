package com.ecopedia.carga;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Artefacto desplegable {@code ecopedia-carga}.
 *
 * <p>Va a agrupar los dos componentes <b>stateful</b> del sistema:
 * {@code ServicioDeReservas} (hold temporal del slot) y {@code ServicioDeSesionesDeCarga}
 * (sesión de carga en curso).
 *
 * <p>Están juntos a propósito: aislar todo el estado conversacional en un único artefacto
 * evita tener que coordinarlo entre procesos. Ver ARQUITECTURA_ECOPEDIA.md §6.4.
 */
@SpringBootApplication
public class EcopediaCargaApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcopediaCargaApplication.class, args);
    }
}
