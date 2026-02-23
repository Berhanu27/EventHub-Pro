package com.eventhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BadgeResponse {
    private Long id;
    private String badgeType;
    private String badgeName;
    private String badgeDescription;
    private String badgeIcon;
    private LocalDateTime earnedAt;
    private Integer points;
}
