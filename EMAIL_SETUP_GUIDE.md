# Email Setup Guide - EventHub Pro

This guide explains how to set up real email sending for the forgot password feature using Gmail SMTP.

## Step 1: Create a Gmail Account (or use existing)

If you don't have a Gmail account, create one at https://mail.google.com

## Step 2: Enable 2-Factor Authentication

1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process

## Step 3: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Click "Generate"
4. Google will show a 16-character password - copy it

## Step 4: Configure Backend

### Option A: Using Environment Variables (Recommended for Production)

Set these environment variables before running the backend:

```bash
# Windows CMD
set MAIL_USERNAME=your-email@gmail.com
set MAIL_PASSWORD=your-16-char-app-password

# Windows PowerShell
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="your-16-char-app-password"

# Linux/Mac
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-16-char-app-password
```

Then start the backend:
```bash
cd backend
mvnw.cmd spring-boot:run
```

### Option B: Direct Configuration (Development Only)

Edit `backend/src/main/resources/application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
```

## Step 5: Test Email Sending

### Test via API

1. Register a user at http://localhost:3000/register
2. Set recovery email in account settings
3. Go to http://localhost:3000/forgot-password
4. Enter registered email and recovery email
5. Click "Send Reset Link"
6. Check your recovery email inbox for the reset link

### Check Backend Logs

Look for these messages in the backend console:

```
Password reset email sent to: your-recovery-email@gmail.com
```

If you see errors like:
```
Failed to send password reset email to ...
```

Check the error message for details.

## Troubleshooting

### "Authentication failed" Error

- Verify you're using the 16-character app password (not your Gmail password)
- Make sure 2-Factor Authentication is enabled
- Regenerate the app password and try again

### "Connection refused" Error

- Check that Gmail SMTP is accessible from your network
- Try using a different network or VPN
- Verify port 587 is not blocked by firewall

### Email Not Received

- Check spam/junk folder
- Verify the recovery email address is correct
- Check backend logs for any error messages
- Try sending again (rate limit: 3 requests per hour per email)

### "Too many reset requests" Error

- You can only request 3 password resets per hour per email address
- Wait 1 hour and try again

## Email Templates

The system sends these emails:

### Password Reset Email
- **To:** Recovery email
- **Subject:** Reset your EventHub Pro password
- **Content:** Reset link (expires in 15 minutes)

### Password Changed Notification
- **To:** Both login and recovery email
- **Subject:** Your password has been successfully changed
- **Content:** Confirmation message

## Security Notes

- Never commit real credentials to git
- Always use environment variables for production
- App passwords are specific to Gmail and can be revoked anytime
- Reset links expire after 15 minutes
- Each token can only be used once

## For Production Deployment

1. Set environment variables on your server
2. Use a dedicated email account for notifications
3. Consider using a service like SendGrid or AWS SES for better deliverability
4. Monitor email sending logs
5. Set up bounce/complaint handling

---

**Last Updated:** February 25, 2026
