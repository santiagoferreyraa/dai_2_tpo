package com.ecopedia.charging.booking.data;

import com.ecopedia.charging.booking.domain.ConnectorCatalog;
import com.ecopedia.charging.booking.domain.ConnectorCatalogUnavailableException;
import com.ecopedia.charging.booking.domain.ConnectorSnapshot;
import java.time.Duration;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * {@link ConnectorCatalog} contra la API REST de {@code ecopedia-core}.
 *
 * <p>Vive en la capa de datos porque, para Reservas, preguntarle a otro proceso por un conector
 * es lo mismo que leerlo de una base: es acceso a datos que no son suyos. La capa de negocio solo
 * ve el puerto.
 *
 * <p>Usa {@code GET /api/connectors/{id}}, que en core es público: no hace falta reenviar el
 * token del conductor ni inventar una credencial de servicio para leer un dato que cualquiera
 * puede leer.
 */
@Component
public class CoreConnectorCatalog implements ConnectorCatalog {

    /*
     * Plazos cortos a propósito. Sin ellos, con core caído el pedido del conductor quedaría
     * colgado lo que tarde el sistema operativo en rendirse —minutos—, que en la demo se ve
     * como una pantalla congelada. Con plazo, en tres segundos contesta 503 y se entiende qué
     * pasó.
     */
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(3);

    private final RestClient restClient;

    public CoreConnectorCatalog(RestClient.Builder builder, @Value("${ecopedia.core.url}") String coreUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(CONNECT_TIMEOUT);
        requestFactory.setReadTimeout(READ_TIMEOUT);

        this.restClient =
                builder.baseUrl(coreUrl).requestFactory(requestFactory).build();
    }

    @Override
    public Optional<ConnectorSnapshot> findConnector(Long connectorId) {
        try {
            ConnectorSnapshot connector = restClient
                    .get()
                    .uri("/api/connectors/{id}", connectorId)
                    .retrieve()
                    .body(ConnectorSnapshot.class);
            return Optional.ofNullable(connector);
        } catch (HttpClientErrorException.NotFound notFound) {
            // Core contesta 404 cuando el conector no existe: es una respuesta, no una falla.
            return Optional.empty();
        } catch (RestClientException failure) {
            throw new ConnectorCatalogUnavailableException("No se pudo consultar el conector a ecopedia-core", failure);
        }
    }
}
