package com.eventhub.dto;

import lombok.Data;

@Data
public class ApprovePasswordResetRequest {
    private String newPassword;
}
