package com.eventhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Long eventId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Integer helpfulCount;
    private Double averageRating;
    private Integer totalReviews;
}
