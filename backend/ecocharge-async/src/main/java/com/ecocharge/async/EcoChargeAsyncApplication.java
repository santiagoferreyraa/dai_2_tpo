package com.ecocharge.async;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Artefacto desplegable {@code ecocharge-async}.
 *
 * <p>Va a alojar {@code ServicioDeNotificaciones}, consumidor del broker JMS. No expone
 * API pública: su única entrada son los mensajes de la cola y del tópico.
 *
 * <p>Por eso arranca sin servidor web y se mantiene vivo con {@code spring.main.keep-alive}
 * (ver application.yml). Cuando exista el primer {@code @JmsListener}, el propio listener
 * sostiene el proceso.
 */
@SpringBootApplication
public class EcoChargeAsyncApplication {

    public static void main(String[] args) {
        SpringApplication.run(EcoChargeAsyncApplication.class, args);
    }
}
