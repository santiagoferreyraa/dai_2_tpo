package com.ecopedia.integration.security;

import org.springframework.security.core.Authentication;

/**
 * Saca del token quién está haciendo la petición.
 *
 * <p><b>Acá el usuario es un id, no un email, y esa es una diferencia real con core.</b> En
 * {@code ecopedia-core} el principal es el email y {@code UserController} lo cambia por el usuario
 * buscándolo en su tabla. Este artefacto no tiene tabla de usuarios ni forma de consultarla: el
 * conductor dueño de una tarjeta se identifica con el id que el token trae en el {@code subject},
 * que es exactamente el motivo por el que Usuarios lo pone ahí.
 *
 * <p>El id se toma del token sin volver a preguntar por él. Lo que garantiza que corresponda a un
 * usuario real es la firma: solo Usuarios puede emitirlo. Si ese usuario se dio de baja después,
 * el token sigue valiendo hasta que vence — es el costo conocido de la autenticación stateless,
 * el mismo que ya tiene core, y no algo que este componente introduzca.
 */
public final class AuthenticatedUser {

    private AuthenticatedUser() {}

    /**
     * El id del usuario autenticado.
     *
     * <p>Solo se llama desde métodos que {@code @PreAuthorize} ya obligó a estar autenticados, así
     * que llegar acá sin {@link Authentication} es un error de programación —una anotación que se
     * borró— y no un caso a contemplar. Por eso falla fuerte en vez de devolver {@code null}.
     */
    public static Long idOf(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalStateException("Se pidió el usuario autenticado en un endpoint sin autenticación");
        }
        return Long.valueOf(authentication.getName());
    }
}
