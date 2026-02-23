package com.eventhub.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;
    
    private String paymentProof;
    
    private String paymentMethod;
}
