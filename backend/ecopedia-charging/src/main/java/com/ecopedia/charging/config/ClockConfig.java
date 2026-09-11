package com.ecopedia.charging.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * El reloj del artefacto, como bean.
 *
 * <p>Reservas decide todo contra la hora —si una ventana ya empezó, si una retención venció— y
 * con {@code Instant.now()} escrito adentro no habría forma de probar esas reglas sin esperar
 * de verdad. Inyectado, un test le pasa un reloj fijo.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
