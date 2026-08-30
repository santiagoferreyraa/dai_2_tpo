package com.ecopedia.core.terminal.web.dto;

import com.ecopedia.core.terminal.domain.StationData;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record StationRequest(
        @NotBlank(message = "El nombre es obligatorio") String name,
        @NotBlank(message = "La dirección es obligatoria") String address,
        @NotNull(message = "La latitud es obligatoria") Double latitude,
        @NotNull(message = "La longitud es obligatoria") Double longitude,
        List<String> photoUrls) {
    public StationData toDomainData() {
        return new StationData(name, address, latitude, longitude, photoUrls);
    }
}
