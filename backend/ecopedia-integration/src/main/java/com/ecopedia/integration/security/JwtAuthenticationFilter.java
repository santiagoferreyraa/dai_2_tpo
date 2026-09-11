package com.ecopedia.integration.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Pone en el contexto de seguridad al usuario que viene firmado en el encabezado.
 *
 * <p><b>El principal es el id del usuario, no el email.</b> Ver {@link AuthenticatedUser}: este
 * artefacto no tiene con qué resolver un email a un usuario, y el dueño de una tarjeta se guarda
 * por id.
 *
 * <p><b>El rol se toma como texto, sin convertirlo a un enum.</b> Copiar el {@code Role} de core
 * acá crearía dos definiciones del mismo conjunto en dos artefactos, y agregar un rol pasaría a
 * ser acordarse de tocar las dos. Lo que este componente necesita del rol es compararlo, y para
 * eso alcanza la autoridad {@code ROLE_<texto>} que espera {@code hasRole(...)}. Un rol que no
 * exista no coincide con ninguna regla, que es el resultado correcto.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenReader tokenReader;

    public JwtAuthenticationFilter(JwtTokenReader tokenReader) {
        this.tokenReader = tokenReader;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = bearerTokenOf(request);

        if (StringUtils.hasText(token)) {
            tokenReader.read(token).ifPresent(claims -> authenticate(claims, request));
        }

        /*
         * Sin token, o con uno inválido, la petición sigue como anónima: quien la rechaza es el
         * @PreAuthorize del método, no este filtro. Cortar acá dejaría sin respuesta útil a los
         * endpoints públicos y convertiría cualquier ruta nueva en privada por omisión.
         */
        filterChain.doFilter(request, response);
    }

    private void authenticate(Claims claims, HttpServletRequest request) {
        String role = claims.get("role", String.class);
        if (!StringUtils.hasText(role)) return;

        var authentication = new UsernamePasswordAuthenticationToken(
                claims.getSubject(), null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    private String bearerTokenOf(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
