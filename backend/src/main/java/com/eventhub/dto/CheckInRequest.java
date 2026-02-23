package com.eventhub.dto;

import lombok.Data;

@Data
public class CheckInRequest {
    private Long eventId;
    private Double latitude;
    private Double longitude;
    private String deviceInfo;
    private String verificationMethod; // QR_CODE, GPS, MANUAL, TICKET_CODE
    private String ticketCode; // For manual verification
}
