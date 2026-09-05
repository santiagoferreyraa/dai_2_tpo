package com.ecopedia.core.terminal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ecopedia.core.terminal.data.JpaConnectorRepository;
import com.ecopedia.core.terminal.data.JpaStationRepository;
import com.ecopedia.core.terminal.domain.Station;
import com.ecopedia.core.terminal.domain.StationData;
import com.ecopedia.core.terminal.domain.TerminalService;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Pruebas de los endpoints de lectura de estaciones contra la aplicación levantada.
 *
 * <p><b>Por qué existe esta clase.</b> {@code TerminalServiceTest} le pone dobles a los
 * repositorios, así que nunca hay una base ni una sesión de Hibernate y los errores de carga
 * perezosa le pasan por al lado. Esta clase levanta el contexto entero —Flyway, JPA y la capa
 * web— y pide los recursos como los pide el navegador. Es la única forma de que
 * {@code mvn verify} vea una clase de error que hasta ahora aparecía recién al arrancar la
 * aplicación a mano.
 *
 * <p><b>No lleva {@code @Transactional}, y es a propósito.</b> Anotar la clase haría que cada
 * prueba corriera adentro de una transacción abierta, o sea con una sesión de Hibernate viva
 * durante la petición. Eso inicializaría las colecciones perezosas de casualidad y estas
 * pruebas pasarían aunque el error estuviera presente: justamente lo que vinieron a detectar.
 * Por eso los datos se limpian a mano en {@link #cleanUp()}.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class TerminalApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TerminalService terminalService;

    @Autowired
    private JpaStationRepository stationRepository;

    @Autowired
    private JpaConnectorRepository connectorRepository;

    /*
     * El perfil 'dev' usa H2 con DB_CLOSE_DELAY=-1, así que la base sobrevive a cada prueba
     * dentro de la misma JVM. Sin esta limpieza, una prueba vería las estaciones de la anterior.
     * Los conectores van primero: son los que apuntan a la estación.
     */
    @AfterEach
    void cleanUp() {
        connectorRepository.deleteAll();
        stationRepository.deleteAll();
    }

    private Station givenStation(String name, List<String> photoUrls) {
        return terminalService.createStation(
                new StationData(name, "Av. San Juan 2901", -34.603754, -58.381659, photoUrls));
    }

    @Test
    @DisplayName("El listado devuelve las estaciones con sus fotos")
    void listsStationsWithTheirPhotos() throws Exception {
        givenStation("YPF Constitución", List.of("https://example.com/a.jpg"));

        mockMvc.perform(get("/api/estaciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("YPF Constitución"))
                .andExpect(jsonPath("$[0].photoUrls[0]").value("https://example.com/a.jpg"));
    }

    /*
     * Una estación sin fotos no es un caso de borde: la colección vacía también es perezosa y
     * rompe igual que una con datos. Sin esta prueba, el error se escaparía en la mitad de los
     * casos.
     */
    @Test
    @DisplayName("El listado devuelve también las estaciones sin fotos")
    void listsStationsWithoutPhotos() throws Exception {
        givenStation("Estación sin fotos", List.of());

        mockMvc.perform(get("/api/estaciones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].photoUrls").isEmpty());
    }

    @Test
    @DisplayName("La consulta por id devuelve la estación con sus fotos")
    void readsOneStationWithItsPhotos() throws Exception {
        Station station = givenStation("YPF Constitución", List.of("https://example.com/a.jpg"));

        mockMvc.perform(get("/api/estaciones/{id}", station.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.photoUrls[0]").value("https://example.com/a.jpg"));
    }
}
