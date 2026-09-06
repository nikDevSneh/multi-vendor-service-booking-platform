package booking_platform.controller;

import booking_platform.dto.BookingResponse;
import booking_platform.entity.Booking;
import booking_platform.entity.BookingStatus;
import booking_platform.service.BookingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestParam Long serviceId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startTime,
            Authentication authentication) {

        String email = authentication.getName();

        Long customerId =
                bookingService.getUserIdByEmail(email);

        Booking booking =
                bookingService.createBooking(
                        customerId,
                        serviceId,
                        startTime
                );

        return ResponseEntity.ok(
                bookingService.convertToResponse(booking)
        );
    }

    @GetMapping("/customer")
    public ResponseEntity<List<BookingResponse>> getCustomerBookings(
            Authentication authentication) {

        String email = authentication.getName();

        Long customerId =
                bookingService.getUserIdByEmail(email);

        List<Booking> bookings =
                bookingService.getCustomerBookings(customerId);

        List<BookingResponse> responses =
                bookings.stream()
                        .map(bookingService::convertToResponse)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/vendor")
    public ResponseEntity<List<BookingResponse>> getVendorBookings(
            Authentication authentication) {

        String email = authentication.getName();

        Long userId =
                bookingService.getUserIdByEmail(email);

        Long vendorId =
                bookingService.getVendorIdByUserId(userId);

        List<Booking> bookings =
                bookingService.getVendorBookings(vendorId);

        List<BookingResponse> responses =
                bookings.stream()
                        .map(bookingService::convertToResponse)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status,
            Authentication authentication) {

        String email = authentication.getName();

        Long userId =
                bookingService.getUserIdByEmail(email);

        Long vendorId =
                bookingService.getVendorIdByUserId(userId);

        Booking booking =
                bookingService.updateBookingStatus(
                        bookingId,
                        status,
                        vendorId
                );

        return ResponseEntity.ok(
                bookingService.convertToResponse(booking)
        );
    }

    @GetMapping("/test")
    public String bookingTest() {
        return "Booking controller is working!";
    }
}