package booking_platform.repository;

import booking_platform.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
            Long serviceId,
            LocalDateTime endTime,
            LocalDateTime startTime);

    List<Booking> findByCustomerId(Long customerId);

    List<Booking> findByServiceVendorId(Long vendorId);
}