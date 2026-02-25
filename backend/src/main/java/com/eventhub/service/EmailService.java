package com.eventhub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import lombok.extern.slf4j.Slf4j;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class EmailService {
    
    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;
    
    @Value("${sendgrid.from-email:noreply@eventhub.com}")
    private String fromEmail;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public void sendVerificationEmail(String email, String verificationLink, String emailType) {
        sendEmail(email, "Verify your EventHub Pro " + emailType + " email", 
            "Click the link below to verify your " + emailType + " email:\n\n" + verificationLink);
    }
    
    public void sendPasswordResetEmail(String recoveryEmail, String resetLink) {
        sendEmail(recoveryEmail, "Reset your EventHub Pro password", 
            "Click the link below to reset your password:\n\n" + resetLink + "\n\nThis link expires in 15 minutes.");
        log.info("Password reset email sent to: {}", recoveryEmail);
    }
    
    public void sendPasswordChangedNotification(String loginEmail, String recoveryEmail) {
        String message = "Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately.";
        sendEmail(loginEmail, "Your password has been successfully changed", message);
        log.info("Password changed notification sent to: {}", loginEmail);
        
        sendEmail(recoveryEmail, "Your password has been successfully changed", message);
        log.info("Password changed notification sent to recovery email: {}", recoveryEmail);
    }
    
    public void sendRecoveryEmailChangeNotification(String oldRecoveryEmail) {
        sendEmail(oldRecoveryEmail, "Your recovery email has been changed", 
            "Your EventHub Pro recovery email has been changed. If you did not make this change, please contact support immediately.");
        log.info("Recovery email change notification sent to: {}", oldRecoveryEmail);
    }
    
    private void sendEmail(String to, String subject, String text) {
        try {
            if (sendGridApiKey == null || sendGridApiKey.isEmpty()) {
                log.error("SendGrid API key is not configured!");
                return;
            }
            
            Map<String, Object> mail = new HashMap<>();
            
            Map<String, String> from = new HashMap<>();
            from.put("email", fromEmail);
            mail.put("from", from);
            
            List<Map<String, Object>> personalizations = new ArrayList<>();
            Map<String, Object> personalization = new HashMap<>();
            
            List<Map<String, String>> toList = new ArrayList<>();
            Map<String, String> toEmail = new HashMap<>();
            toEmail.put("email", to);
            toList.add(toEmail);
            personalization.put("to", toList);
            personalizations.add(personalization);
            
            mail.put("personalizations", personalizations);
            mail.put("subject", subject);
            
            List<Map<String, String>> content = new ArrayList<>();
            Map<String, String> contentItem = new HashMap<>();
            contentItem.put("type", "text/plain");
            contentItem.put("value", text);
            content.add(contentItem);
            
            mail.put("content", content);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String apiKey = sendGridApiKey != null ? sendGridApiKey.trim() : "";
            if (!apiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + apiKey);
            }
            
            HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(mail), headers);
            restTemplate.postForObject("https://api.sendgrid.com/v3/mail/send", request, String.class);
            
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
