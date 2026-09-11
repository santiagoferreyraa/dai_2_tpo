package com.ecopedia.charging.booking.data;

import com.ecopedia.charging.booking.domain.Booking;
import com.ecopedia.charging.booking.domain.BookingRepository;
import com.ecopedia.charging.booking.domain.BookingStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaBookingRepository extends JpaRepository<Booking, Long>, BookingRepository {

    @Override
    List<Booking> findByConnectorIdAndStatus(Long connectorId, BookingStatus status);
}
