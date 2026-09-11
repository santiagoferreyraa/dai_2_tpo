package com.ecopedia.charging.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Lee el token de la cabecera {@code Authorization} y, si es válido, deja al usuario en el
 * contexto de seguridad con la autoridad {@code ROLE_<rol>}.
 *
 * <p>Arma la autoridad igual que el filtro de core, así una misma anotación
 * {@code hasRole('CONDUCTOR')} significa lo mismo en los dos artefactos.
 *
 * <p>Un token inválido no corta el pedido acá: sigue como anónimo, y quien lo rechaza es el
 * {@code @PreAuthorize} del controlador. Es el mismo criterio que core, y por eso un pedido sin
 * token recibe 403 en los dos.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenValidator tokenValidator;

    public JwtAuthenticationFilter(JwtTokenValidator tokenValidator) {
        this.tokenValidator = tokenValidator;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (header != null && header.startsWith(BEARER_PREFIX)) {
            tokenValidator
                    .authenticate(header.substring(BEARER_PREFIX.length()))
                    .ifPresent(user -> SecurityContextHolder.getContext()
                            .setAuthentication(new UsernamePasswordAuthenticationToken(
                                    user, null, List.of(new SimpleGrantedAuthority("ROLE_" + user.role())))));
        }

        filterChain.doFilter(request, response);
    }
}
