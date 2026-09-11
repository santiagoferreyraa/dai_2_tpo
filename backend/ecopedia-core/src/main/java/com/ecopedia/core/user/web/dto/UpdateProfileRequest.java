package com.ecopedia.core.user.web.dto;

import com.ecopedia.core.user.domain.ProfileData;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Lo que se puede cambiar del propio perfil (RF01).
 *
 * <p><b>Solo el nombre, y la lista corta es la regla de negocio.</b> El email identifica al
 * usuario y viaja adentro del token: cambiarlo por acá dejaría al que está logueado con una
 * sesión emitida a nombre de una cuenta que ya no existe. El rol es una decisión
 * administrativa, igual que en el alta —si se aceptara acá, cualquiera se promovería a
 * {@code ADMIN} desde la pantalla de perfil y las anotaciones del sistema dejarían de valer—.
 * Y la baja tiene su propia operación, que es del administrador.
 *
 * <p>Un cuerpo que igual mande {@code "email"} o {@code "role"} no falla: Jackson descarta las
 * propiedades que el record no declara.
 *
 * <p>El largo máximo es el de la columna. Sin esta anotación, un nombre de más de 120
 * caracteres no lo rechaza la validación sino la base, y eso llega al usuario como un 500.
 */
public record UpdateProfileRequest(
        @NotBlank(message = "El nombre completo es obligatorio")
                @Size(max = 120, message = "El nombre completo no puede superar los 120 caracteres")
                String fullName) {

    public ProfileData toDomainData() {
        return new ProfileData(fullName);
    }
}
