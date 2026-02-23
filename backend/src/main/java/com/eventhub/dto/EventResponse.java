package com.eventhub.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime date;
    private LocalDateTime endDate;
    private Integer maxAttendees;
    private Long currentAttendees;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private String status;
    private Boolean isFeatured;
    private String createdByName;
    private Long createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
