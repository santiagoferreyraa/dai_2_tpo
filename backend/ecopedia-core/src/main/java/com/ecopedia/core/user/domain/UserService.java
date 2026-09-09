package com.ecopedia.core.user.domain;

import java.util.List;

/**
 * Interfaz pública del componente {@code ServicioDeUsuarios} (stateless).
 *
 * <p>Cubre RF01, RF03 y las tareas ECO-23, ECO-24, ECO-25.
 */
public interface UserService {

    /** Registro de un usuario nuevo (conductor, CPO u admin). */
    User register(RegistrationData data);

    /** Autenticación de credenciales y emisión de token JWT. */
    AuthToken authenticate(Credentials credentials);

    /** Consulta de perfil por ID. */
    User getProfile(Long userId);

    /**
     * Consulta de perfil por email, que es lo que identifica al usuario dentro del token.
     *
     * <p>Existe para que quien atiende una petición autenticada no tenga que recorrer el
     * padrón buscando quién la hizo: el email viaja en el token y la columna es única, así que
     * la consulta va directo. Es la operación sobre la que se apoya la pantalla de perfil.
     */
    User getProfileByEmail(String email);

    /** Actualización de datos de perfil. */
    User updateProfile(Long userId, ProfileData data);

    /** Baja lógica de un usuario (solo ADMIN). */
    void deactivateUser(Long userId);

    /** Listado de usuarios, opcionalmente filtrado por rol. */
    List<User> listUsers(Role roleFilter);
}
