package com.ecopedia.core.user;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ecopedia.core.security.JwtTokenProvider;
import com.ecopedia.core.user.data.JpaUserRepository;
import com.ecopedia.core.user.domain.RegistrationData;
import com.ecopedia.core.user.domain.Role;
import com.ecopedia.core.user.domain.User;
import com.ecopedia.core.user.domain.UserService;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * Seguridad declarativa del backoffice de usuarios (ECO-25).
 *
 * <p><b>La otra mitad del criterio.</b> ECO-25 pide que el ABM de estaciones sea solo del
 * Operador <i>y que el backoffice sea solo del Administrador</i>, las dos cosas verificadas
 * con un test. El ABM lo cubre {@code TerminalAuthorizationTest}; esta clase cubre el
 * backoffice, que tenía las anotaciones puestas y ninguna prueba que las sostuviera. Sin esto,
 * borrar un {@code @PreAuthorize} en un merge deja {@code mvn verify} en verde.
 *
 * <p><b>Firma un JWT de verdad</b>, igual que la clase hermana, así que cada caso recorre el
 * filtro entero antes de llegar a la anotación. Para el test no hace falta promover un usuario
 * a administrador en la base: el token se emite directamente con el rol pedido, que es lo mismo
 * que devolvería el login de un usuario ya promovido.
 *
 * <p><b>El perfil propio no es backoffice y por eso se prueba aparte.</b> {@code /profile}
 * responde con los datos de quien pregunta, sea cual sea su rol; lo único que exige es estar
 * autenticado. Meterlo en la lista de operaciones restringidas sería documentar una regla que
 * el dominio no tiene.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class UserAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private JpaUserRepository userRepository;

    @AfterEach
    void cleanUp() {
        userRepository.deleteAll();
    }

    private String bearer(Role role) {
        return "Bearer " + tokenProvider.generateToken(1L, role.name().toLowerCase() + "@ecopedia.test", role);
    }

    private User givenUser(String email, Role role) {
        return userService.register(new RegistrationData(email, "unaClave123", "Usuario " + role, role));
    }

    /** Las tres operaciones de backoffice que declara {@code UserController}. */
    private List<MockHttpServletRequestBuilder> backOfficeRequests() {
        return List.of(get("/api/users"), get("/api/users/1"), delete("/api/users/1"));
    }

    @Test
    @DisplayName("Sin token, las tres operaciones de backoffice son rechazadas")
    void rejectsBackOfficeForAnonymousCallers() throws Exception {
        for (MockHttpServletRequestBuilder request : backOfficeRequests()) {
            mockMvc.perform(request).andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Con token de CONDUCTOR, las tres operaciones de backoffice son rechazadas")
    void rejectsBackOfficeForDrivers() throws Exception {
        for (MockHttpServletRequestBuilder request : backOfficeRequests()) {
            mockMvc.perform(request.header(HttpHeaders.AUTHORIZATION, bearer(Role.CONDUCTOR)))
                    .andExpect(status().isForbidden());
        }
    }

    /*
     * El operador es el caso que un chequeo por "estar logueado" dejaría pasar y el que más
     * daño hace: es un usuario legítimo de la plataforma, con rol propio, que no tiene por qué
     * ver el padrón de conductores ni darlos de baja.
     */
    @Test
    @DisplayName("Con token de CPO, las tres operaciones de backoffice son rechazadas")
    void rejectsBackOfficeForOperators() throws Exception {
        for (MockHttpServletRequestBuilder request : backOfficeRequests()) {
            mockMvc.perform(request.header(HttpHeaders.AUTHORIZATION, bearer(Role.CPO)))
                    .andExpect(status().isForbidden());
        }
    }

    @Test
    @DisplayName("Con token de ADMIN, el backoffice funciona: listar, consultar y dar de baja")
    void allowsBackOfficeForAdmins() throws Exception {
        String admin = bearer(Role.ADMIN);
        User driver = givenUser("conductor@ecopedia.test", Role.CONDUCTOR);

        mockMvc.perform(get("/api/users").header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("conductor@ecopedia.test"));

        mockMvc.perform(get("/api/users/" + driver.getId()).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CONDUCTOR"));

        mockMvc.perform(delete("/api/users/" + driver.getId()).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isNoContent());

        /*
         * La baja es lógica: el usuario sigue existiendo y la consulta lo devuelve con active
         * en false. Comprobarlo importa porque un 204 solo dice que la operación se aceptó, no
         * que haya hecho lo que promete.
         */
        mockMvc.perform(get("/api/users/" + driver.getId()).header(HttpHeaders.AUTHORIZATION, admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));
    }

    /*
     * El filtro por rol es la única variante de la operación de listado, y se prueba acá
     * porque es la consulta con la que el administrador arma el padrón de operadores.
     */
    @Test
    @DisplayName("El ADMIN puede filtrar el listado por rol")
    void allowsFilteringUsersByRole() throws Exception {
        givenUser("conductor@ecopedia.test", Role.CONDUCTOR);
        givenUser("operador@ecopedia.test", Role.CPO);

        mockMvc.perform(get("/api/users").param("rol", "CPO").header(HttpHeaders.AUTHORIZATION, bearer(Role.ADMIN)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("operador@ecopedia.test"));
    }

    /*
     * El perfil propio responde 401 y no 403 cuando falta el token, porque el controlador lo
     * chequea a mano en vez de delegarlo en una anotación. Queda documentado acá para que la
     * diferencia con el 403 del resto no parezca un error cuando alguien la vea en la demo.
     */
    @Test
    @DisplayName("El perfil propio exige token, pero no exige un rol en particular")
    void keepsOwnProfileOpenToEveryAuthenticatedRole() throws Exception {
        givenUser("conductor@ecopedia.test", Role.CONDUCTOR);

        mockMvc.perform(get("/api/users/profile")).andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/users/profile")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + tokenProvider.generateToken(1L, "conductor@ecopedia.test", Role.CONDUCTOR)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CONDUCTOR"));
    }
}
