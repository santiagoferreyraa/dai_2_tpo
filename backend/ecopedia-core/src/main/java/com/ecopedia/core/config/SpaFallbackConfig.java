package com.ecopedia.core.config;

import java.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Hace que el frontend empaquetado dentro del JAR responda a las rutas de React Router.
 *
 * <p><b>El problema que resuelve.</b> El frontend es una SPA: el servidor entrega un solo
 * {@code index.html} y de ahí en más las rutas las resuelve el navegador. Eso funciona
 * mientras se navegue con links, pero si alguien entra directo a {@code /stations} —o
 * simplemente refresca la página— el navegador le pide esa ruta al servidor, que no tiene
 * ningún archivo con ese nombre y devuelve 404. En la demo se ve como "la aplicación se rompe
 * al apretar F5", que es la peor forma de descubrirlo.
 *
 * <p><b>La regla.</b> Si el archivo pedido existe en {@code /static/} se sirve tal cual; si no
 * existe, se devuelve {@code index.html} y que el ruteo lo resuelva React. Con dos
 * excepciones: lo que empieza con {@code api/}, porque ahí un 404 es una respuesta legítima de
 * la API y taparlo con el HTML del frontend haría que el cliente reciba una página cuando
 * espera JSON; y el caso en que no haya frontend empaquetado.
 *
 * <p><b>Solo aplica al JAR de producción</b>, el que se arma con {@code mvn -Pweb package}. En
 * desarrollo el frontend lo sirve Vite en su propio puerto y estas rutas nunca llegan acá:
 * como no hay {@code /static/index.html} en el classpath, esta clase no hace nada.
 */
@Configuration
public class SpaFallbackConfig implements WebMvcConfigurer {

    /** Donde el perfil 'web' deja el dist/ de Vite. Ver el pom de este módulo. */
    private static final String STATIC_ROOT = "classpath:/static/";

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations(STATIC_ROOT)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {

                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);

                        // Un archivo de verdad: el JS, el CSS, un ícono. Se sirve y listo.
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }

                        // La API contesta por su cuenta, incluidos sus 404.
                        if (resourcePath.startsWith("api/")) {
                            return null;
                        }

                        // Una ruta del frontend. Sin frontend empaquetado, 404 como siempre.
                        Resource index = location.createRelative("index.html");
                        return index.exists() ? index : null;
                    }
                });
    }
}
