package com.eventhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "check_in_streaks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckInStreak {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "current_streak")
    private Integer currentStreak = 0; // Number of consecutive days
    
    @Column(name = "longest_streak")
    private Integer longestStreak = 0;
    
    @Column(name = "last_check_in_date")
    private LocalDate lastCheckInDate;
    
    @Column(name = "total_check_ins")
    private Integer totalCheckIns = 0;
    
    @Column(name = "total_points")
    private Integer totalPoints = 0;
}
