package booking_platform.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class VendorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    private String businessName;

    private String description;

    private String category;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL)
    private List<ServiceListing> services;

    public VendorProfile() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<ServiceListing> getServices() {
        return services;
    }

    public void setServices(List<ServiceListing> services) {
        this.services = services;
    }
}