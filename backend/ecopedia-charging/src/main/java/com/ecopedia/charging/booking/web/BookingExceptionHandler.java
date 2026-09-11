package com.ecopedia.charging.booking.web;

import com.ecopedia.charging.booking.domain.ConnectorCatalogUnavailableException;
import com.ecopedia.charging.booking.domain.ConnectorNotBookableException;
import com.ecopedia.charging.booking.domain.ConnectorNotFoundException;
import com.ecopedia.charging.booking.domain.InvalidBookingRequestException;
import com.ecopedia.charging.booking.domain.SlotUnavailableException;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Traduce las excepciones de Reservas a respuestas HTTP con cuerpo {@code ProblemDetail}, el
 * mismo formato que usa core: el cliente HTTP del front ya sabe leer su {@code detail}.
 *
 * <p>Acotado con {@code basePackageClasses} al paquete web de Reservas, por lo mismo que en
 * core: un advice suelto atraparía también las excepciones de SesionesDeCarga cuando exista.
 *
 * <p>Cada caso tiene su código, y no es por prolijidad: el front decide qué decirle al conductor
 * según el número. 404 es "elegiste un conector que no existe", 409 es "ese slot no se puede",
 * 503 es "probá de nuevo en un rato".
 */
@RestControllerAdvice(basePackageClasses = BookingExceptionHandler.class)
public class BookingExceptionHandler {

    @ExceptionHandler(InvalidBookingRequestException.class)
    public ProblemDetail handleInvalidRequest(InvalidBookingRequestException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    @ExceptionHandler(ConnectorNotFoundException.class)
    public ProblemDetail handleUnknownConnector(ConnectorNotFoundException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler({ConnectorNotBookableException.class, SlotUnavailableException.class})
    public ProblemDetail handleConflict(RuntimeException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, exception.getMessage());
    }

    @ExceptionHandler(ConnectorCatalogUnavailableException.class)
    public ProblemDetail handleCoreDown(ConnectorCatalogUnavailableException exception) {
        return ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE, "No se pudo verificar el conector. Probá de nuevo en un momento.");
    }

    /** Campos que no pasan las anotaciones del DTO. Se juntan todos, igual que en core. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleInvalidFields(MethodArgumentNotValidException exception) {
        String detail = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .filter(message -> message != null && !message.isBlank())
                .distinct()
                .collect(Collectors.joining(". "));

        return ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, detail.isBlank() ? "Los datos enviados no son válidos" : detail);
    }
}
