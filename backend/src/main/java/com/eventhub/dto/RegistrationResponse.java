package com.eventhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RegistrationResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private LocalDateTime registeredAt;
    private String status;
    private String paymentMethod;
    private String paymentProof;
    private String ticketCode;
    private Integer registrationOrder;
    private Long totalAttendees;
    private LocalDateTime approvedAt;
    private Boolean checkedIn;
    private LocalDateTime checkedInAt;
}
