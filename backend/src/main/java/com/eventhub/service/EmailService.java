package com.eventhub.service;

import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.Email;
import com.sendgrid.helpers.mail.Content;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import java.io.IOException;

@Service
@Slf4j
public class EmailService {
    
    @Value("${sendgrid.api-key}")
    private String sendGridApiKey;
    
    @Value("${sendgrid.from-email:noreply@eventhub.com}")
    private String fromEmail;
    
    public void sendVerificationEmail(String email, String verificationLink, String emailType) {
        try {
            Mail mail = new Mail(
                new Email(fromEmail),
                "Verify your EventHub Pro " + emailType + " email",
                new Email(email),
                new Content("text/plain", "Click the link below to verify your " + emailType + " email:\n\n" + verificationLink)
            );
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            com.sendgrid.helpers.mail.Request request = new com.sendgrid.helpers.mail.Request();
            request.setMethod(com.sendgrid.helpers.mail.Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
            log.info("Verification email sent to: {}", email);
        } catch (IOException e) {
            log.warn("Failed to send verification email to {}: {}", email, e.getMessage());
        }
    }
    
    public void sendPasswordResetEmail(String recoveryEmail, String resetLink) {
        try {
            Mail mail = new Mail(
                new Email(fromEmail),
                "Reset your EventHub Pro password",
                new Email(recoveryEmail),
                new Content("text/plain", "Click the link below to reset your password:\n\n" + resetLink + "\n\nThis link expires in 15 minutes.")
            );
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            com.sendgrid.helpers.mail.Request request = new com.sendgrid.helpers.mail.Request();
            request.setMethod(com.sendgrid.helpers.mail.Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
            log.info("Password reset email sent to: {}", recoveryEmail);
        } catch (IOException e) {
            log.warn("Failed to send password reset email to {}: {}", recoveryEmail, e.getMessage());
        }
    }
    
    public void sendPasswordChangedNotification(String loginEmail, String recoveryEmail) {
        try {
            Mail mail = new Mail(
                new Email(fromEmail),
                "Your password has been successfully changed",
                new Email(loginEmail),
                new Content("text/plain", "Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately.")
            );
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            com.sendgrid.helpers.mail.Request request = new com.sendgrid.helpers.mail.Request();
            request.setMethod(com.sendgrid.helpers.mail.Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
            log.info("Password changed notification sent to: {}", loginEmail);
        } catch (IOException e) {
            log.warn("Failed to send password changed notification to {}: {}", loginEmail, e.getMessage());
        }
        
        try {
            Mail mail = new Mail(
                new Email(fromEmail),
                "Your password has been successfully changed",
                new Email(recoveryEmail),
                new Content("text/plain", "Your EventHub Pro password has been successfully changed. If you did not make this change, please contact support immediately.")
            );
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            com.sendgrid.helpers.mail.Request request = new com.sendgrid.helpers.mail.Request();
            request.setMethod(com.sendgrid.helpers.mail.Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
            log.info("Password changed notification sent to recovery email: {}", recoveryEmail);
        } catch (IOException e) {
            log.warn("Failed to send password changed notification to recovery email {}: {}", recoveryEmail, e.getMessage());
        }
    }
    
    public void sendRecoveryEmailChangeNotification(String oldRecoveryEmail) {
        try {
            Mail mail = new Mail(
                new Email(fromEmail),
                "Your recovery email has been changed",
                new Email(oldRecoveryEmail),
                new Content("text/plain", "Your EventHub Pro recovery email has been changed. If you did not make this change, please contact support immediately.")
            );
            
            SendGrid sg = new SendGrid(sendGridApiKey);
            com.sendgrid.helpers.mail.Request request = new com.sendgrid.helpers.mail.Request();
            request.setMethod(com.sendgrid.helpers.mail.Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            sg.api(request);
            log.info("Recovery email change notification sent to: {}", oldRecoveryEmail);
        } catch (IOException e) {
            log.warn("Failed to send recovery email change notification to {}: {}", oldRecoveryEmail, e.getMessage());
        }
    }
}
