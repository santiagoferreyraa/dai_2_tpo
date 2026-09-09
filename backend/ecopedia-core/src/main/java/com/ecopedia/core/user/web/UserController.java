package com.ecopedia.core.user.web;

import com.ecopedia.core.user.domain.Role;
import com.ecopedia.core.user.domain.User;
import com.ecopedia.core.user.domain.UserService;
import com.ecopedia.core.user.web.dto.UserProfileResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Consulta del perfil del usuario autenticado.
     *
     * <p><b>La regla la pone la anotación, no un {@code if}.</b> Antes el método comprobaba a
     * mano que hubiera autenticación, que es justo lo que ECO-25 dice evitar: una regla de
     * acceso escondida dentro del cuerpo no se ve al leer la firma, no la aplica el contenedor
     * y se pierde en la primera refactorización. {@code isAuthenticated()} pide lo mismo que
     * pedía el {@code if} —estar logueado, con cualquier rol— y lo deja declarado.
     *
     * <p><b>Y el usuario se busca, no se filtra.</b> La versión anterior traía el padrón
     * entero de la base para quedarse con una fila: con veinte usuarios no se nota, pero es
     * una consulta que crece con la plataforma para responder algo que el token ya identifica.
     */
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        User user = userService.getProfileByEmail(authentication.getName());
        return ResponseEntity.ok(UserProfileResponse.fromDomain(user));
    }

    /** Consulta de usuario por ID (Solo ADMIN - ECO-25). */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long id) {
        User user = userService.getProfile(id);
        return ResponseEntity.ok(UserProfileResponse.fromDomain(user));
    }

    /** Listar usuarios (Solo ADMIN - ECO-25 / ECO-27). */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserProfileResponse>> listUsers(@RequestParam(required = false) Role role) {
        List<User> users = userService.listUsers(role);
        return ResponseEntity.ok(
                users.stream().map(UserProfileResponse::fromDomain).toList());
    }

    /** Baja lógica de usuario (Solo ADMIN - ECO-25 / ECO-27). */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }
}
