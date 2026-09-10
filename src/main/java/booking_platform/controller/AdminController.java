package booking_platform.controller;
import org.springframework.transaction.annotation.Transactional;
import booking_platform.entity.Booking;
import booking_platform.entity.BookingStatus;
import booking_platform.entity.ServiceListing;
import booking_platform.entity.User;
import booking_platform.entity.VendorProfile;
import booking_platform.repository.BookingRepository;
import booking_platform.repository.ServiceListingRepository;
import booking_platform.repository.UserRepository;
import booking_platform.repository.VendorProfileRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final UserRepository userRepository;
    private final ServiceListingRepository serviceRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final BookingRepository bookingRepository;

    public AdminController(
            UserRepository userRepository,
            ServiceListingRepository serviceRepository,
            VendorProfileRepository vendorProfileRepository,
            BookingRepository bookingRepository) {

        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.bookingRepository = bookingRepository;
    }

    // =========================================================
    // STATS
    // =========================================================

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {

        long users = userRepository.count();
        long services = serviceRepository.count();
        long bookings = bookingRepository.count();

        return ResponseEntity.ok(
                Map.of(
                        "users", users,
                        "services", services,
                        "bookings", bookings
                )
        );
    }

    // =========================================================
    // USERS
    // =========================================================

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @Transactional
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        User user = userRepository.findById(id).orElse(null);

        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // Delete bookings belonging to this customer
        List<Booking> customerBookings =
                bookingRepository.findByCustomerId(id);

        if (!customerBookings.isEmpty()) {
            bookingRepository.deleteAll(customerBookings);
        }

        // If vendor, delete vendor's services and their bookings
        VendorProfile vendorProfile =
                vendorProfileRepository.findByUserId(id).orElse(null);

        if (vendorProfile != null) {

            List<ServiceListing> services =
                    serviceRepository.findByVendorId(vendorProfile.getId());

            for (ServiceListing service : services) {

                List<Booking> serviceBookings =
                        bookingRepository
                                .findByServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                                        service.getId(),
                                        java.time.LocalDateTime.of(9999, 12, 31, 23, 59),
                                        java.time.LocalDateTime.of(1, 1, 1, 0, 0)
                                );

                if (!serviceBookings.isEmpty()) {
                    bookingRepository.deleteAll(serviceBookings);
                }
            }

            if (!services.isEmpty()) {
                serviceRepository.deleteAll(services);
            }

            vendorProfileRepository.delete(vendorProfile);
        }

        userRepository.delete(user);

        return ResponseEntity.ok(
                Map.of("message", "User deleted successfully")
        );
    }

    // =========================================================
    // SERVICES
    // =========================================================

    @GetMapping("/services")
    public ResponseEntity<List<ServiceListing>> getServices() {
        return ResponseEntity.ok(serviceRepository.findAll());
    }

    @Transactional
    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {

        ServiceListing service =
                serviceRepository.findById(id).orElse(null);

        if (service == null) {
            return ResponseEntity.notFound().build();
        }

        /*
         * Delete bookings connected to this service first.
         */
        List<Booking> bookings =
                bookingRepository
                        .findByServiceIdAndStartTimeLessThanAndEndTimeGreaterThan(
                                id,
                                java.time.LocalDateTime.of(
                                        9999, 12, 31, 23, 59
                                ),
                                java.time.LocalDateTime.of(
                                        1, 1, 1, 0, 0
                                )
                        );

        if (!bookings.isEmpty()) {
            bookingRepository.deleteAll(bookings);
        }

        serviceRepository.delete(service);

        return ResponseEntity.ok(
                Map.of("message", "Service deleted successfully")
        );
    }

    // =========================================================
    // BOOKINGS
    // =========================================================

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }

    @PutMapping("/bookings/{id}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Booking booking =
                bookingRepository.findById(id).orElse(null);

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        BookingStatus newStatus;

        try {
            newStatus =
                    BookingStatus.valueOf(status.toUpperCase());

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Invalid booking status. Allowed values: " +
                                    "PENDING, CONFIRMED, CANCELLED, COMPLETED"
                    )
            );
        }

        booking.setStatus(newStatus);

        bookingRepository.save(booking);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Booking status updated successfully",
                        "bookingId",
                        id,
                        "status",
                        newStatus.name()
                )
        );
    }

    // =========================================================
    // DELETE BOOKING
    // =========================================================

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable Long id) {

        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        bookingRepository.deleteById(id);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Booking deleted successfully"
                )
        );
    }

    // =========================================================
    // TEST
    // =========================================================

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok(
                "Admin controller is working!"
        );
    }
}