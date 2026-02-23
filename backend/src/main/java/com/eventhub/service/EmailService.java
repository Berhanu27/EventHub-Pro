package com.eventhub.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    
    public void sendVerificationEmail(String email, String verificationLink, String emailType) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Verify your EventHub Pro " + emailType + " email");
        message.setText("Click the link below to verify your " + emailType + " email:\n\n" + verificationLink);
        mailSender.send(message);
    }
    
    public void sendPasswordResetEmail(String recoveryEmail, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recoveryEmail);
        message.setSubject("Reset your EventHub Pro password");
        message.setText("Click the link below to reset your password:\n\n" + resetLink + "\n\nThis link expires in 15 minutes.");
        mailSender.send(message);
    }
    
    public void sendPasswordChangedNotification(String loginEmail, String recoveryEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(loginEmail);
        message.setSubject("Your password has been successfully changed");
        message.setText("Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately.");
        mailSender.send(message);
        
        SimpleMailMessage recoveryMessage = new SimpleMailMessage();
        recoveryMessage.setTo(recoveryEmail);
        recoveryMessage.setSubject("Your password has been successfully changed");
        recoveryMessage.setText("Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately.");
        mailSender.send(recoveryMessage);
    }
    
    public void sendRecoveryEmailChangeNotification(String oldRecoveryEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(oldRecoveryEmail);
        message.setSubject("Your recovery email has been changed");
        message.setText("Your EventHub Pro recovery email has been changed. If you did not make this change, please contact support immediately.");
        mailSender.send(message);
    }
}
