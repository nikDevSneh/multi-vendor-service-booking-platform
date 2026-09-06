package booking_platform.service;

import booking_platform.dto.BookingResponse;
import booking_platform.entity.Booking;
import booking_platform.entity.BookingStatus;
import booking_platform.entity.ServiceListing;
import booking_platform.entity.User;
import booking_platform.entity.VendorProfile;
import booking_platform.exception.BookingAuthorizationException;
import booking_platform.exception.BookingConflictException;
import booking_platform.repository.BookingRepository;
import booking_platform.repository.ServiceListingRepository;
import booking_platform.repository.UserRepository;
import booking_platform.repository.VendorProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceListingRepository serviceListingRepository;
    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ServiceListingRepository serviceListingRepository,
            UserRepository userRepository,
            VendorProfileRepository vendorProfileRepository) {

        this.bookingRepository = bookingRepository;
        this.serviceListingRepository = serviceListingRepository;
        this.userRepository = userRepository;
        this.vendorProfileRepository = vendorProfileRepository;
    }

    // Find user ID using email from JWT
    public Long getUserIdByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();
    }

    // Find vendor profile ID using user ID
    public Long getVendorIdByUserId(Long userId) {

        VendorProfile vendorProfile =
                vendorProfileRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor profile not found"));

        return vendorProfile.getId();
    }

    // Create booking
    public Booking createBooking(
            Long customerId,
            Long serviceId,
            LocalDateTime startTime) {

        User customer =
                userRepository.findById(customerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"));

        ServiceListing service =
                serviceListingRepository.findById(serviceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Service not found"));

        LocalDateTime endTime =
                startTime.plusMinutes(
                        service.getDurationMinutes());

        List<Booking> conflicts =
                bookingRepository
                        .findByServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                                serviceId,
                                endTime,
                                startTime
                        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Service is already booked for this time"
            );
        }

        Booking booking = new Booking();

        booking.setCustomer(customer);
        booking.setService(service);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    // Get customer bookings
    public List<Booking> getCustomerBookings(Long customerId) {

        userRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"));

        return bookingRepository.findByCustomerId(customerId);
    }

    // Get vendor bookings
    public List<Booking> getVendorBookings(Long vendorId) {

        return bookingRepository.findByServiceVendorId(vendorId);
    }

    // Update booking status
    public Booking updateBookingStatus(
            Long bookingId,
            BookingStatus status,
            Long vendorId) {

        Booking booking =
                bookingRepository.findById(bookingId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Booking not found"));

        ServiceListing service = booking.getService();

        if (service.getVendor() == null ||
                !service.getVendor().getId().equals(vendorId)) {

            throw new BookingAuthorizationException(
                    "You are not authorized to update this booking"
            );
        }

        booking.setStatus(status);

        return bookingRepository.save(booking);
    }

    // Convert Booking entity to DTO
    public BookingResponse convertToResponse(
            Booking booking) {

        return new BookingResponse(
                booking.getId(),
                booking.getCustomer().getId(),
                booking.getService().getId(),
                booking.getService().getTitle(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus()
        );
    }
}