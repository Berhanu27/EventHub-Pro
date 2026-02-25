package com.eventhub.service;

import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.Email;
import com.sendgrid.helpers.mail.Content;
import com.sendgrid.helpers.mail.Personalization;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {
    
    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;
    
    @Value("${sendgrid.from-email:noreply@eventhub.com}")
    private String fromEmail;
    
    public void sendVerificationEmail(String email, String verificationLink, String emailType) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail));
            mail.setSubject("Verify your EventHub Pro " + emailType + " email");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(email));
            mail.addPersonalization(personalization);
            
            mail.addContent(new Content("text/plain", "Click the link below to verify your " + emailType + " email:\n\n" + verificationLink));
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            sg.api(new com.sendgrid.helpers.mail.Request());
            log.info("Verification email sent to: {}", email);
        } catch (Exception e) {
            log.warn("Failed to send verification email to {}: {}", email, e.getMessage());
        }
    }
    
    public void sendPasswordResetEmail(String recoveryEmail, String resetLink) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail));
            mail.setSubject("Reset your EventHub Pro password");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(recoveryEmail));
            mail.addPersonalization(personalization);
            
            mail.addContent(new Content("text/plain", "Click the link below to reset your password:\n\n" + resetLink + "\n\nThis link expires in 15 minutes."));
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            sg.api(new com.sendgrid.helpers.mail.Request());
            log.info("Password reset email sent to: {}", recoveryEmail);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", recoveryEmail, e.getMessage());
        }
    }
    
    public void sendPasswordChangedNotification(String loginEmail, String recoveryEmail) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail));
            mail.setSubject("Your password has been successfully changed");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(loginEmail));
            mail.addPersonalization(personalization);
            
            mail.addContent(new Content("text/plain", "Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately."));
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            sg.api(new com.sendgrid.helpers.mail.Request());
            log.info("Password changed notification sent to: {}", loginEmail);
        } catch (Exception e) {
            log.warn("Failed to send password changed notification to {}: {}", loginEmail, e.getMessage());
        }
        
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail));
            mail.setSubject("Your password has been successfully changed");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(recoveryEmail));
            mail.addPersonalization(personalization);
            
            mail.addContent(new Content("text/plain", "Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately."));
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            sg.api(new com.sendgrid.helpers.mail.Request());
            log.info("Password changed notification sent to recovery email: {}", recoveryEmail);
        } catch (Exception e) {
            log.warn("Failed to send password changed notification to recovery email {}: {}", recoveryEmail, e.getMessage());
        }
    }
    
    public void sendRecoveryEmailChangeNotification(String oldRecoveryEmail) {
        try {
            Mail mail = new Mail();
            mail.setFrom(new Email(fromEmail));
            mail.setSubject("Your recovery email has been changed");
            
            Personalization personalization = new Personalization();
            personalization.addTo(new Email(oldRecoveryEmail));
            mail.addPersonalization(personalization);
            
            mail.addContent(new Content("text/plain", "Your EventHub Pro recovery email has been changed. If you did not make this change, please contact support immediately."));
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            sg.api(new com.sendgrid.helpers.mail.Request());
            log.info("Recovery email change notification sent to: {}", oldRecoveryEmail);
        } catch (Exception e) {
            log.warn("Failed to send recovery email change notification to {}: {}", oldRecoveryEmail, e.getMessage());
        }
    }
}
