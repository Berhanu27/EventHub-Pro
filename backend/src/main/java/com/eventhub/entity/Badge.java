package com.eventhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "badge_type")
    private String badgeType; // FIRST_CHECKIN, STREAK_5, STREAK_10, STREAK_30, EARLY_BIRD, NIGHT_OWL, SOCIAL_BUTTERFLY
    
    @Column(name = "badge_name")
    private String badgeName;
    
    @Column(name = "badge_description")
    private String badgeDescription;
    
    @Column(name = "badge_icon")
    private String badgeIcon; // emoji or icon URL
    
    @Column(name = "earned_at")
    private LocalDateTime earnedAt = LocalDateTime.now();
    
    @Column(name = "points")
    private Integer points = 0; // Reward points
}
