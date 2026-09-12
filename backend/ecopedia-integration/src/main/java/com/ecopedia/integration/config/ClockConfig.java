package com.ecopedia.integration.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * El reloj del que cuelga todo lo que este módulo compara contra "hoy".
 *
 * <p>Existe para que el vencimiento de una tarjeta se pueda probar. Con {@code YearMonth.now()}
 * escrito adentro del código, la única forma de verificar que una tarjeta vencida se rechaza es
 * elegir un año pasado y confiar en que nadie corra el test en 1999; y la de verificar que una
 * vigente se acepta es elegir un año lejano que, con el tiempo suficiente, deja de serlo. Un test
 * que caduca solo es un test que alguien va a borrar dentro de unos años sin saber qué probaba.
 *
 * <p>Inyectando el reloj, la prueba fija la fecha y el caso queda escrito sin depender de cuándo
 * se lo ejecute.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
