package com.eventhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CheckInResponse {
    private Long id;
    private Long userId;
    private Long eventId;
    private LocalDateTime createdAt;
    private Double latitude;
    private Double longitude;
    private Boolean isVerified;
    private String verificationMethod;
    private Double fraudScore;
    private Boolean isFlagged;
    private String flagReason;
    
    // Streak info
    private Integer currentStreak;
    private Integer totalCheckIns;
    private Integer totalPoints;
    
    // Badges earned
    private java.util.List<BadgeResponse> newBadges;
}
