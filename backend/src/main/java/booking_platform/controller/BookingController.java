package booking_platform.controller;

import booking_platform.dto.BookingResponse;
import booking_platform.entity.BookingStatus;
import booking_platform.entity.User;
import booking_platform.exception.BookingAuthorizationException;
import booking_platform.exception.BookingConflictException;
import booking_platform.repository.UserRepository;
import booking_platform.service.BookingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    public BookingController(
            BookingService bookingService,
            UserRepository userRepository) {

        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestParam Long serviceId,
            @RequestParam String startTime,
            Authentication authentication) {

        try {

            User user = getCurrentUser(authentication);

            LocalDateTime parsedStartTime =
                    LocalDateTime.parse(startTime);

            BookingResponse response =
                    bookingService.createBooking(
                            user.getId(),
                            serviceId,
                            parsedStartTime
                    );

            return ResponseEntity.ok(response);

        } catch (BookingConflictException e) {

            return ResponseEntity
                    .status(409)
                    .body(Map.of("message", e.getMessage()));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerBookings(
            Authentication authentication) {

        try {

            User user = getCurrentUser(authentication);

            List<BookingResponse> bookings =
                    bookingService.getCustomerBookings(
                            user.getId()
                    );

            return ResponseEntity.ok(bookings);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/vendor")
    public ResponseEntity<?> getVendorBookings(
            Authentication authentication) {

        try {

            User user = getCurrentUser(authentication);

            List<BookingResponse> bookings =
                    bookingService.getVendorBookings(
                            user.getId()
                    );

            return ResponseEntity.ok(bookings);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestParam BookingStatus status,
            Authentication authentication) {

        try {

            User user = getCurrentUser(authentication);

            BookingResponse response =
                    bookingService.updateBookingStatus(
                            bookingId,
                            user.getId(),
                            status
                    );

            return ResponseEntity.ok(response);

        } catch (BookingAuthorizationException e) {

            return ResponseEntity
                    .status(403)
                    .body(Map.of("message", e.getMessage()));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {

        try {

            User user = getCurrentUser(authentication);

            BookingResponse response =
                    bookingService.cancelBooking(
                            bookingId,
                            user.getId()
                    );

            return ResponseEntity.ok(response);

        } catch (BookingAuthorizationException e) {

            return ResponseEntity
                    .status(403)
                    .body(Map.of("message", e.getMessage()));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {

        return ResponseEntity.ok(
                "Booking controller is working!"
        );
    }

    private User getCurrentUser(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        )
                );
    }
}