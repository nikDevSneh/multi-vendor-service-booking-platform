package booking_platform.service;

import booking_platform.entity.ServiceListing;
import booking_platform.entity.VendorProfile;
import booking_platform.exception.ServiceAuthorizationException;
import booking_platform.repository.ServiceListingRepository;
import booking_platform.repository.VendorProfileRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ServiceListingService {

    private final ServiceListingRepository serviceListingRepository;
    private final VendorProfileRepository vendorProfileRepository;

    public ServiceListingService(
            ServiceListingRepository serviceListingRepository,
            VendorProfileRepository vendorProfileRepository) {

        this.serviceListingRepository =
                serviceListingRepository;

        this.vendorProfileRepository =
                vendorProfileRepository;
    }

    // =========================================================
    // CREATE SERVICE
    // =========================================================

    public ServiceListing createService(
            Long userId,
            String title,
            String description,
            BigDecimal price,
            Integer durationMinutes) {

        validateService(
                title,
                description,
                price,
                durationMinutes
        );

        VendorProfile vendor =
                vendorProfileRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor profile not found"
                                ));

        ServiceListing service =
                new ServiceListing();

        service.setTitle(title.trim());
        service.setDescription(
                description == null
                        ? ""
                        : description.trim()
        );
        service.setPrice(price);
        service.setDurationMinutes(durationMinutes);
        service.setVendor(vendor);

        return serviceListingRepository.save(service);
    }

    // =========================================================
    // GET VENDOR SERVICES
    // =========================================================

    public List<ServiceListing> getVendorServices(
            Long userId) {

        VendorProfile vendor =
                vendorProfileRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vendor profile not found"
                                ));

        return serviceListingRepository
                .findByVendorId(vendor.getId());
    }

    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    public ServiceListing updateService(
            Long serviceId,
            Long userId,
            String title,
            String description,
            BigDecimal price,
            Integer durationMinutes) {

        validateService(
                title,
                description,
                price,
                durationMinutes
        );

        ServiceListing service =
                getOwnedService(
                        serviceId,
                        userId
                );

        service.setTitle(title.trim());
        service.setDescription(
                description == null
                        ? ""
                        : description.trim()
        );
        service.setPrice(price);
        service.setDurationMinutes(
                durationMinutes
        );

        return serviceListingRepository.save(service);
    }

    // =========================================================
    // DELETE SERVICE
    // =========================================================

    public void deleteService(
            Long serviceId,
            Long userId) {

        ServiceListing service =
                getOwnedService(
                        serviceId,
                        userId
                );

        serviceListingRepository.delete(service);
    }

    // =========================================================
    // OWNERSHIP CHECK
    // =========================================================

    private ServiceListing getOwnedService(
            Long serviceId,
            Long userId) {

        ServiceListing service =
                serviceListingRepository
                        .findById(serviceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Service not found"
                                ));

        VendorProfile vendor =
                service.getVendor();

        if (vendor == null ||
                vendor.getUser() == null ||
                !vendor.getUser()
                        .getId()
                        .equals(userId)) {

            throw new ServiceAuthorizationException(
                    "You are not authorized to modify this service"
            );
        }

        return service;
    }

    // =========================================================
    // GET ALL SERVICES
    // =========================================================

    public List<ServiceListing> getAllServices() {

        return serviceListingRepository.findAll();
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateService(
            String title,
            String description,
            BigDecimal price,
            Integer durationMinutes) {

        if (title == null ||
                title.trim().isEmpty()) {

            throw new RuntimeException(
                    "Service title is required"
            );
        }

        if (title.trim().length() < 2) {

            throw new RuntimeException(
                    "Service title must contain at least 2 characters"
            );
        }

        if (price == null) {

            throw new RuntimeException(
                    "Service price is required"
            );
        }

        if (price.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Service price must be greater than 0"
            );
        }

        if (durationMinutes == null) {

            throw new RuntimeException(
                    "Service duration is required"
            );
        }

        if (durationMinutes <= 0) {

            throw new RuntimeException(
                    "Service duration must be greater than 0 minutes"
            );
        }

        if (durationMinutes > 1440) {

            throw new RuntimeException(
                    "Service duration cannot exceed 24 hours"
            );
        }
    }
}