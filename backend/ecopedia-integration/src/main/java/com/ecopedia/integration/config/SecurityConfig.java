package com.ecopedia.integration.config;

import com.ecopedia.integration.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Seguridad del artefacto {@code ecopedia-integration}.
 *
 * <p><b>La cadena deja pasar todas las URL y quien decide es la anotación del método.</b> Es el
 * mismo criterio que en core, y no es pereza: las reglas de Pagos no se expresan por ruta sino por
 * dueño —{@code DELETE /api/payment-methods/{id}} lo puede hacer el conductor dueño de esa tarjeta
 * y ningún otro—, y eso una lista de patrones de URL no lo sabe decir. Con {@code @PreAuthorize} la
 * regla queda escrita en la firma del método que protege, donde se la lee al leer el endpoint.
 *
 * <p><b>Sin sesión de servidor.</b> {@code STATELESS} es lo que corresponde a un componente que
 * autentica por token: sin esto Spring crea una {@code HttpSession} por petición autenticada, que
 * es estado conversacional en un artefacto que RNF09 clasifica como stateless y que además habría
 * que replicar al escalarlo horizontalmente.
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests.requestMatchers("/h2-console/**")
                        .permitAll()
                        .anyRequest()
                        .permitAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
