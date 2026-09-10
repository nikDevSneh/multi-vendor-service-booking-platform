package booking_platform.controller;

import booking_platform.entity.ServiceListing;
import booking_platform.entity.User;
import booking_platform.exception.ServiceAuthorizationException;
import booking_platform.repository.UserRepository;
import booking_platform.service.ServiceListingService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:5173")
public class ServiceController {

    private final ServiceListingService serviceListingService;
    private final UserRepository userRepository;

    public ServiceController(
            ServiceListingService serviceListingService,
            UserRepository userRepository) {

        this.serviceListingService = serviceListingService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ServiceListing>> getAllServices() {

        return ResponseEntity.ok(
                serviceListingService.getAllServices()
        );
    }

    @PostMapping
    public ResponseEntity<?> createService(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer durationMinutes,
            Authentication authentication) {

        try {

            Long userId = getUserId(authentication);

            ServiceListing service =
                    serviceListingService.createService(
                            userId,
                            title,
                            description,
                            price,
                            durationMinutes
                    );

            return ResponseEntity.ok(service);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<?> updateService(
            @PathVariable Long serviceId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer durationMinutes,
            Authentication authentication) {

        try {

            Long userId = getUserId(authentication);

            ServiceListing updated =
                    serviceListingService.updateService(
                            serviceId,
                            userId,
                            title,
                            description,
                            price,
                            durationMinutes
                    );

            return ResponseEntity.ok(updated);

        } catch (ServiceAuthorizationException e) {

            return ResponseEntity
                    .status(403)
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<?> deleteService(
            @PathVariable Long serviceId,
            Authentication authentication) {

        try {

            Long userId = getUserId(authentication);

            serviceListingService.deleteService(
                    serviceId,
                    userId
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Service deleted successfully"
                    )
            );

        } catch (ServiceAuthorizationException e) {

            return ResponseEntity
                    .status(403)
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    @GetMapping("/vendor")
    public ResponseEntity<?> getVendorServices(
            Authentication authentication) {

        try {

            Long userId = getUserId(authentication);

            return ResponseEntity.ok(
                    serviceListingService
                            .getVendorServices(userId)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "message",
                            e.getMessage()
                    ));
        }
    }

    private Long getUserId(
            Authentication authentication) {

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "Not authenticated"
            );
        }

        String email = authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        return user.getId();
    }
}