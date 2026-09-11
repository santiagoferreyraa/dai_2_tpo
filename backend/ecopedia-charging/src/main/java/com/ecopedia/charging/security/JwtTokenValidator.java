package com.ecopedia.charging.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Valida los tokens que emite {@code ecopedia-core} y lee quién es el usuario.
 *
 * <p><b>Solo valida: no emite.</b> El login es de core, que es donde está la tabla de usuarios.
 * Este artefacto confía en la firma —si el token está firmado con el secreto compartido, lo
 * emitió core— y lee de él lo que necesita, sin preguntarle a nadie. Es lo que hace que la
 * identidad viaje en el token y que Usuarios no sea dependencia de ningún otro componente.
 *
 * <p>Lee los mismos tres datos que core escribe en {@code JwtTokenProvider}: el id en el
 * {@code sub}, y el mail y el rol como claims. Si core cambia esos nombres, este archivo cambia
 * con él.
 */
@Component
public class JwtTokenValidator {

    private final SecretKey key;

    public JwtTokenValidator(@Value("${ecopedia.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** El usuario del token, o vacío si la firma no cierra, está vencido o le falta un dato. */
    public Optional<AuthenticatedUser> authenticate(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String role = claims.get("role", String.class);
            if (claims.getSubject() == null || role == null) {
                return Optional.empty();
            }

            return Optional.of(new AuthenticatedUser(
                    Long.parseLong(claims.getSubject()), claims.get("email", String.class), role));
        } catch (JwtException | IllegalArgumentException invalid) {
            // IllegalArgumentException cubre también un "sub" que no es un número.
            return Optional.empty();
        }
    }
}
