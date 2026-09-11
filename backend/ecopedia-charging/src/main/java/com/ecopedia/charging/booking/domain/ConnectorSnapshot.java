package com.ecopedia.charging.booking.domain;

/**
 * Lo que Reservas lee de un conector, en el momento en que lo pregunta.
 *
 * <p>El estado viaja como texto y no como una copia del enum de core: si Terminales suma un
 * estado nuevo, este artefacto no se cae al leerlo. La única pregunta que Reservas le hace es si
 * está fuera de servicio.
 *
 * <p>Que el conector esté OCUPADO ahora no impide reservarlo: la reserva es para una ventana
 * futura, y quien carga ahora ya se habrá ido.
 */
public record ConnectorSnapshot(Long id, Long stationId, String operationalStatus) {

    public boolean isOutOfService() {
        return "OUT_OF_SERVICE".equals(operationalStatus);
    }
}
