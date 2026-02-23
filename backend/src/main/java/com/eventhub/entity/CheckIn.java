package com.eventhub.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "check_ins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckIn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    // GPS Coordinates
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    // Device Info
    @Column(name = "device_info")
    private String deviceInfo;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    // Verification
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "verification_method")
    private String verificationMethod; // QR_CODE, GPS, MANUAL, TICKET_CODE
    
    // Fraud Detection
    @Column(name = "fraud_score")
    private Double fraudScore = 0.0; // 0-100, higher = more suspicious
    
    @Column(name = "is_flagged")
    private Boolean isFlagged = false;
    
    @Column(name = "flag_reason")
    private String flagReason;
}
