package com.ecopedia.core.user.web;

import com.ecopedia.core.user.domain.Role;
import com.ecopedia.core.user.domain.User;
import com.ecopedia.core.user.domain.UserService;
import com.ecopedia.core.user.web.dto.ChangePasswordRequest;
import com.ecopedia.core.user.web.dto.UpdateProfileRequest;
import com.ecopedia.core.user.web.dto.UserProfileResponse;
import jakarta.validation.Valid;
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

    /**
     * Actualización del propio perfil (RF01).
     *
     * <p><b>El usuario a modificar no viaja en la URL: sale del token.</b> Un
     * {@code PUT /api/users/{id}} abierto a cualquier autenticado deja que un conductor le
     * cambie el nombre a otro con solo probar números, y taparlo exigiría comparar a mano el id
     * de la ruta contra el del token en cada método —una regla de acceso escondida en el
     * cuerpo, que es lo que ECO-25 pide evitar—. Sin id en la firma no hay nada que comparar:
     * la operación solo puede alcanzar a quien la pide.
     *
     * <p>Devuelve el perfil ya guardado y no un 204, para que la pantalla muestre lo que quedó
     * en la base en vez de lo que ella misma mandó.
     */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        User user = userService.getProfileByEmail(authentication.getName());
        User updated = userService.updateProfile(user.getId(), request.toDomainData());
        return ResponseEntity.ok(UserProfileResponse.fromDomain(updated));
    }

    /**
     * Cambio de la propia contraseña (RF01).
     *
     * <p>Mismo criterio que la edición del perfil: el usuario sale del token y no de la URL, así
     * que la operación solo puede alcanzar a quien la pide. Acá pesa más todavía, porque un
     * {@code PUT} con id ajeno sería quedarse con la cuenta de otro.
     *
     * <p>Devuelve 204 y no el perfil: no hay nada que mostrar después de cambiarla, y el hash
     * nuevo no es algo que deba salir del servidor. La sesión abierta sigue valiendo —el token
     * ya emitido no depende de la contraseña—, así que no hay que volver a entrar.
     */
    @PutMapping("/profile/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changeMyPassword(
            Authentication authentication, @Valid @RequestBody ChangePasswordRequest request) {
        User user = userService.getProfileByEmail(authentication.getName());
        userService.changePassword(user.getId(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
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
