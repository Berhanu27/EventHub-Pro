package com.eventhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private LocalDateTime date;
    
    private LocalDateTime endDate;
    
    @Column(nullable = false)
    private Integer maxAttendees;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    
    private String category;
    
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;
    
    private Double latitude;
    
    private Double longitude;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.UPCOMING;
    
    @Column(nullable = false)
    private Boolean isFeatured = false;
    
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum EventStatus {
        UPCOMING, ONGOING, COMPLETED, CANCELLED
    }
}
