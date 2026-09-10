package booking_platform.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
public class ServiceListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    private BigDecimal price;

    private Integer durationMinutes;

    @ManyToOne
    @JoinColumn(name = "vendor_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private VendorProfile vendor;

    public ServiceListing() {
    }

    public ServiceListing(
            Long id,
            String title,
            String description,
            BigDecimal price,
            Integer durationMinutes,
            VendorProfile vendor) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.durationMinutes = durationMinutes;
        this.vendor = vendor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public VendorProfile getVendor() {
        return vendor;
    }

    public void setVendor(VendorProfile vendor) {
        this.vendor = vendor;
    }
}