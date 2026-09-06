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

    /** Consulta del perfil del usuario autenticado. */
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getMyProfile(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String email = authentication.getPrincipal().toString();
        User user = userService.listUsers(null).stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

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
    public ResponseEntity<List<UserProfileResponse>> listUsers(@RequestParam(required = false) Role rol) {
        List<User> users = userService.listUsers(rol);
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
