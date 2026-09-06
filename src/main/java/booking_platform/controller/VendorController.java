package booking_platform.controller;

import booking_platform.entity.User;
import booking_platform.entity.VendorProfile;
import booking_platform.repository.UserRepository;
import booking_platform.repository.VendorProfileRepository;
import booking_platform.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

    private final VendorProfileRepository vendorProfileRepository;
    private final UserRepository userRepository;
    private final BookingService bookingService;

    public VendorController(
            VendorProfileRepository vendorProfileRepository,
            UserRepository userRepository,
            BookingService bookingService) {

        this.vendorProfileRepository = vendorProfileRepository;
        this.userRepository = userRepository;
        this.bookingService = bookingService;
    }

    @PostMapping("/profile")
    public ResponseEntity<VendorProfile> createVendorProfile(
            @RequestParam String businessName,
            @RequestParam String description,
            @RequestParam String category,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        VendorProfile vendorProfile = new VendorProfile();

        vendorProfile.setUser(user);
        vendorProfile.setBusinessName(businessName);
        vendorProfile.setDescription(description);
        vendorProfile.setCategory(category);

        VendorProfile savedProfile =
                vendorProfileRepository.save(vendorProfile);

        return ResponseEntity.ok(savedProfile);
    }

    @GetMapping("/test")
    public String vendorTest() {
        return "Vendor controller is working!";
    }
}