package booking_platform.service;

import booking_platform.dto.BookingResponse;
import booking_platform.entity.Booking;
import booking_platform.entity.BookingStatus;
import booking_platform.entity.ServiceListing;
import booking_platform.entity.User;
import booking_platform.exception.BookingAuthorizationException;
import booking_platform.exception.BookingConflictException;
import booking_platform.repository.BookingRepository;
import booking_platform.repository.ServiceListingRepository;
import booking_platform.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ServiceListingRepository serviceListingRepository;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            ServiceListingRepository serviceListingRepository,
            UserRepository userRepository) {

        this.bookingRepository = bookingRepository;
        this.serviceListingRepository = serviceListingRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE BOOKING
    // =========================================================

    public BookingResponse createBooking(
            Long customerId,
            Long serviceId,
            LocalDateTime startTime) {

        User customer = userRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        ServiceListing service = serviceListingRepository
                .findById(serviceId)
                .orElseThrow(() ->
                        new RuntimeException("Service not found"));

        if (startTime == null) {
            throw new RuntimeException(
                    "Booking start time is required");
        }

        if (!startTime.isAfter(LocalDateTime.now())) {
            throw new RuntimeException(
                    "Booking time must be in the future");
        }

        Integer duration = service.getDurationMinutes();

        if (duration == null || duration <= 0) {
            throw new RuntimeException(
                    "Invalid service duration");
        }

        LocalDateTime endTime =
                startTime.plusMinutes(duration);

        // Check overlapping bookings
        List<Booking> conflicts =
                bookingRepository
                        .findByServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                                serviceId,
                                endTime,
                                startTime
                        );

        boolean hasConflict = conflicts.stream()
                .anyMatch(booking ->
                        booking.getStatus() != BookingStatus.CANCELLED
                );

        if (hasConflict) {
            throw new BookingConflictException(
                    "This service is already booked for the selected time"
            );
        }

        Booking booking = new Booking();

        booking.setCustomer(customer);
        booking.setService(service);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking =
                bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    // =========================================================
    // CUSTOMER BOOKINGS
    // =========================================================

    public List<BookingResponse> getCustomerBookings(
            Long customerId) {

        return bookingRepository
                .findByCustomerId(customerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // VENDOR BOOKINGS
    // =========================================================

    public List<BookingResponse> getVendorBookings(
            Long vendorId) {

        return bookingRepository
                .findByServiceVendorId(vendorId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // UPDATE BOOKING STATUS
    // =========================================================

    public BookingResponse updateBookingStatus(
            Long bookingId,
            Long vendorId,
            BookingStatus status) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        if (booking.getService() == null ||
                booking.getService().getVendor() == null ||
                booking.getService()
                        .getVendor()
                        .getUser() == null ||
                !booking.getService()
                        .getVendor()
                        .getUser()
                        .getId()
                        .equals(vendorId)) {

            throw new BookingAuthorizationException(
                    "You are not authorized to update this booking"
            );
        }

        if (status == null) {
            throw new RuntimeException(
                    "Booking status is required");
        }

        booking.setStatus(status);

        Booking savedBooking =
                bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    // =========================================================
    // CUSTOMER CANCEL BOOKING
    // =========================================================

    public BookingResponse cancelBooking(
            Long bookingId,
            Long userId) {

        Booking booking = bookingRepository
                .findById(bookingId)
                .orElseThrow(() ->
                        new RuntimeException("Booking not found"));

        if (booking.getCustomer() == null ||
                !booking.getCustomer()
                        .getId()
                        .equals(userId)) {

            throw new BookingAuthorizationException(
                    "You are not authorized to cancel this booking"
            );
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new RuntimeException(
                    "Completed bookings cannot be cancelled"
            );
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException(
                    "Booking is already cancelled"
            );
        }

        booking.setStatus(BookingStatus.CANCELLED);

        Booking savedBooking =
                bookingRepository.save(booking);

        return toResponse(savedBooking);
    }

    // =========================================================
    // DTO CONVERSION
    // =========================================================

    public BookingResponse toResponse(Booking booking) {

        BookingResponse response =
                new BookingResponse();

        response.setId(booking.getId());

        if (booking.getCustomer() != null) {
            response.setCustomerId(
                    booking.getCustomer().getId()
            );
        }

        if (booking.getService() != null) {

            response.setServiceId(
                    booking.getService().getId()
            );

            response.setServiceTitle(
                    booking.getService().getTitle()
            );
        }

        response.setStartTime(
                booking.getStartTime()
        );

        response.setEndTime(
                booking.getEndTime()
        );

        response.setStatus(
                booking.getStatus()
        );

        return response;
    }
}