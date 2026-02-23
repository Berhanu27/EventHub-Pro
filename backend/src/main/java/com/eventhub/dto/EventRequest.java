package com.eventhub.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EventRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotNull(message = "Date is required")
    private LocalDateTime date;
    
    private LocalDateTime endDate;
    
    @Positive(message = "Max attendees must be positive")
    private Integer maxAttendees;
    
    private BigDecimal price;
    
    private String category;
    
    private String imageUrl;
    
    private String status;
    
    private Boolean isFeatured;
}
