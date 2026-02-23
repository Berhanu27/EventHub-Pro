package com.eventhub.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PasswordResetRequestDto {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String reason;
    private LocalDateTime requestedAt;
    private String status;
    private String newPassword;
}
