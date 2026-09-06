package booking_platform.controller;

import booking_platform.entity.ServiceListing;
import booking_platform.entity.VendorProfile;
import booking_platform.repository.ServiceListingRepository;
import booking_platform.repository.VendorProfileRepository;
import booking_platform.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceListingRepository serviceListingRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final BookingService bookingService;

    public ServiceController(
            ServiceListingRepository serviceListingRepository,
            VendorProfileRepository vendorProfileRepository,
            BookingService bookingService) {

        this.serviceListingRepository = serviceListingRepository;
        this.vendorProfileRepository = vendorProfileRepository;
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ServiceListing> createService(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam Integer durationMinutes,
            Authentication authentication) {

        String email = authentication.getName();

        Long userId =
                bookingService.getUserIdByEmail(email);

        Long vendorId =
                bookingService.getVendorIdByUserId(userId);

        VendorProfile vendor =
                vendorProfileRepository.findById(vendorId)
                        .orElseThrow(() ->
                                new RuntimeException("Vendor not found"));

        ServiceListing service = new ServiceListing();

        service.setTitle(title);
        service.setDescription(description);
        service.setPrice(price);
        service.setDurationMinutes(durationMinutes);
        service.setVendor(vendor);

        ServiceListing savedService =
                serviceListingRepository.save(service);

        return ResponseEntity.ok(savedService);
    }

    @GetMapping
    public ResponseEntity<List<ServiceListing>> getAllServices() {

        List<ServiceListing> services =
                serviceListingRepository.findAll();

        return ResponseEntity.ok(services);
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<ServiceListing>> getServicesByVendor(
            @PathVariable Long vendorId) {

        List<ServiceListing> services =
                serviceListingRepository.findByVendorId(vendorId);

        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceListing> getService(
            @PathVariable Long id) {

        ServiceListing service =
                serviceListingRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Service not found"));

        return ResponseEntity.ok(service);
    }

    @GetMapping("/test")
    public String serviceTest() {
        return "Service controller is working!";
    }
}