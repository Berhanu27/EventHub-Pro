package com.eventhub.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    
    public void sendVerificationEmail(String email, String verificationLink, String emailType) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Verify your EventHub Pro " + emailType + " email");
            message.setText("Click the link below to verify your " + emailType + " email:\n\n" + verificationLink);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send verification email to {}: {}", email, e.getMessage());
        }
    }
    
    public void sendPasswordResetEmail(String recoveryEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recoveryEmail);
            message.setSubject("Reset your EventHub Pro password");
            message.setText("Click the link below to reset your password:\n\n" + resetLink + "\n\nThis link expires in 15 minutes.");
            mailSender.send(message);
            log.info("Password reset email sent to: {}", recoveryEmail);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", recoveryEmail, e.getMessage());
        }
    }
    
    public void sendPasswordChangedNotification(String loginEmail, String recoveryEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(loginEmail);
            message.setSubject("Your password has been successfully changed");
            message.setText("Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately.");
            mailSender.send(message);
            log.info("Password changed notification sent to: {}", loginEmail);
        } catch (Exception e) {
            log.warn("Failed to send password changed notification to {}: {}", loginEmail, e.getMessage());
        }
        
        try {
            SimpleMailMessage recoveryMessage = new SimpleMailMessage();
            recoveryMessage.setTo(recoveryEmail);
            recoveryMessage.setSubject("Your password has been successfully changed");
            recoveryMessage.setText("Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately.");
            mailSender.send(recoveryMessage);
            log.info("Password changed notification sent to recovery email: {}", recoveryEmail);
        } catch (Exception e) {
            log.warn("Failed to send password changed notification to recovery email {}: {}", recoveryEmail, e.getMessage());
        }
    }
    
    public void sendRecoveryEmailChangeNotification(String oldRecoveryEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(oldRecoveryEmail);
            message.setSubject("Your recovery email has been changed");
            message.setText("Your EventHub Pro recovery email has been changed. If you did not make this change, please contact support immediately.");
            mailSender.send(message);
            log.info("Recovery email change notification sent to: {}", oldRecoveryEmail);
        } catch (Exception e) {
            log.warn("Failed to send recovery email change notification to {}: {}", oldRecoveryEmail, e.getMessage());
        }
    }
}
