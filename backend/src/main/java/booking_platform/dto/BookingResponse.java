package booking_platform.dto;

import booking_platform.entity.BookingStatus;

import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;
    private Long customerId;
    private Long serviceId;
    private String serviceTitle;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;

    public BookingResponse() {
    }

    public BookingResponse(
            Long id,
            Long customerId,
            Long serviceId,
            String serviceTitle,
            LocalDateTime startTime,
            LocalDateTime endTime,
            BookingStatus status) {

        this.id = id;
        this.customerId = customerId;
        this.serviceId = serviceId;
        this.serviceTitle = serviceTitle;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getServiceId() {
        return serviceId;
    }

    public void setServiceId(Long serviceId) {
        this.serviceId = serviceId;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}