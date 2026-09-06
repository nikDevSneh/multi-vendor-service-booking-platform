package booking_platform.repository;

import booking_platform.entity.ServiceListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceListingRepository
        extends JpaRepository<ServiceListing, Long> {

    List<ServiceListing> findByVendorId(Long vendorId);
}