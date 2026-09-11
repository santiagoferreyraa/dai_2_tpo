package com.ecopedia.charging.booking.web;

import com.ecopedia.charging.booking.domain.BookingService;
import com.ecopedia.charging.booking.domain.Hold;
import com.ecopedia.charging.booking.web.dto.HoldRequest;
import com.ecopedia.charging.booking.web.dto.HoldResponse;
import com.ecopedia.charging.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Capa de presentación del componente <i>Reservas</i>.
 *
 * <p>Las reglas de acceso van acá y no en el servicio, igual que en Terminales: SesionesDeCarga
 * va a consumir {@link BookingService} para operaciones internas que no origina un usuario, y
 * con la regla en el servicio habría que inventarles un rol técnico.
 *
 * <p>{@code 'CONDUCTOR'} y no {@code 'DRIVER'}: es el nombre del rol en el enum de core, que es
 * el que viaja en el token. El documento dice {@code DRIVER} y la divergencia es deliberada.
 *
 * <p>Por ahora expone la retención (ECO-31). Confirmar y cancelar las suma ECO-32 acá mismo.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** RF08: retener un slot mientras el conductor confirma. */
    @PostMapping("/holds")
    @PreAuthorize("hasRole('CONDUCTOR')")
    public ResponseEntity<HoldResponse> startHold(
            @AuthenticationPrincipal AuthenticatedUser driver, @Valid @RequestBody HoldRequest request) {
        Hold hold = bookingService.startHold(request.connectorId(), request.toWindow(), driver.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(HoldResponse.fromDomain(hold));
    }
}
