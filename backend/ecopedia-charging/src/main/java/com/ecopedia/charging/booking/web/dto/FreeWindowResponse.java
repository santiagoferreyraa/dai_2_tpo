package com.ecopedia.charging.booking.web.dto;

import com.ecopedia.charging.booking.domain.TimeWindow;
import java.time.Instant;

/** Un hueco libre de un conector, con el mismo criterio semiabierto de {@link TimeWindow}. */
public record FreeWindowResponse(Instant start, Instant end) {

    public static FreeWindowResponse fromDomain(TimeWindow window) {
        return new FreeWindowResponse(window.start(), window.end());
    }
}
