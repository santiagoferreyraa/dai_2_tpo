package com.ecopedia.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad del artefacto {@code ecopedia-core}.
 *
 * <p><b>Esqueleto deliberado.</b> Hoy deja pasar todas las peticiones. Está así porque el
 * componente de Usuarios todavía no existe: sin esta clase, el solo hecho de tener Spring
 * Security en el classpath bloquearía todos los endpoints detrás de un usuario y una
 * contraseña autogenerada en el log, y nadie podría probar nada a mano.
 *
 * <p>Lo que sí queda habilitado es {@link EnableMethodSecurity}, que es lo que hace que
 * {@code @PreAuthorize} funcione sobre los métodos. Cuando exista la autenticación, lo único
 * que cambia acá es la cadena de filtros: las anotaciones de cada operación ya van a estar
 * escritas y no hay que tocarlas.
 *
 * <p>CSRF va desactivado a propósito: la API es sin estado y la consume un cliente
 * JavaScript, no un formulario con sesión.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(requests -> requests.anyRequest().permitAll())
                .build();
    }
}
