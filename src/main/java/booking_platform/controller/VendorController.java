package booking_platform.controller;

import booking_platform.entity.User;
import booking_platform.entity.VendorProfile;
import booking_platform.repository.UserRepository;
import booking_platform.repository.VendorProfileRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendors")
@CrossOrigin(origins = "http://localhost:5173")
public class VendorController {

    private final VendorProfileRepository vendorProfileRepository;
    private final UserRepository userRepository;

    public VendorController(
            VendorProfileRepository vendorProfileRepository,
            UserRepository userRepository) {

        this.vendorProfileRepository = vendorProfileRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/profile")
    public ResponseEntity<?> createVendorProfile(
            @RequestParam String businessName,
            @RequestParam String description,
            @RequestParam String category,
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User user =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "User not found"
                                    ));

            if (vendorProfileRepository
                    .findByUserId(user.getId())
                    .isPresent()) {

                return ResponseEntity
                        .status(409)
                        .body(Map.of(
                                "message",
                                "Vendor profile already exists"
                        ));
            }

            if (businessName == null ||
                    businessName.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Business name is required"
                        ));
            }

            if (category == null ||
                    category.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(Map.of(
                                "message",
                                "Category is required"
                        ));
            }

            VendorProfile vendorProfile =
                    new VendorProfile();

            vendorProfile.setUser(user);
            vendorProfile.setBusinessName(
                    businessName.trim()
            );
            vendorProfile.setDescription(
                    description == null
                            ? ""
                            : description.trim()
            );
            vendorProfile.setCategory(
                    category.trim()
            );

            VendorProfile savedProfile =
                    vendorProfileRepository
                            .save(vendorProfile);

            return ResponseEntity.ok(savedProfile);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getVendorProfile(
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User user =
                    userRepository
                            .findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "User not found"
                                    ));

            VendorProfile profile =
                    vendorProfileRepository
                            .findByUserId(user.getId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Vendor profile not found"
                                    ));

            return ResponseEntity.ok(profile);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @GetMapping("/test")
    public String vendorTest() {

        return "Vendor controller is working!";
    }
}