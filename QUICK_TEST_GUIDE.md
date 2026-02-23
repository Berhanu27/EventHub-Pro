# Quick Test Guide - Password Reset Feature

## Start the Application

### Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on: `http://localhost:8080`

### Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

## Test Flow

### 1. Register a New User
- Go to `http://localhost:3000/register`
- Fill in: Name, Email, Password
- Click Register
- You should be redirected to login

### 2. Login
- Go to `http://localhost:3000/login`
- Enter email and password
- Click Login
- You should see the dashboard

### 3. Set Recovery Email (Account Settings)
- Click the ⚙️ icon in the top-right navbar
- You'll be taken to `/account-settings`
- Fill in:
  - New Recovery Email: (enter a different email)
  - Current Password: (enter your password)
- Click "Save Recovery Email"
- You should see a success message

### 4. Logout
- Click the "Logout" button in navbar

### 5. Request Password Reset
- Go to `http://localhost:3000/forgot-password`
- Fill in:
  - Registered Email: (the email you registered with)
  - Recovery Email: (the recovery email you just set)
- Click "Send Reset Link"
- You should see: "If the account exists with matching recovery email, a reset link has been sent"

### 6. Get Reset Link from Backend Logs
- Check the backend console output
- Look for a line like: `Reset link: http://localhost:3000/reset-password?token=...`
- Copy the full URL

### 7. Reset Password
- Paste the reset link in your browser
- You should see the "Reset Password" page
- Fill in:
  - New Password: (must have: 8+ chars, uppercase, lowercase, number, special char)
  - Confirm Password: (same as above)
- Watch the password strength indicator fill up (needs all 5 bars)
- Click "Reset Password"
- You should see: "Password has been successfully reset. Please login with your new password."
- You'll be redirected to login after 2 seconds

### 8. Login with New Password
- Enter your email and NEW password
- Click Login
- You should successfully log in

## Expected Behavior

✅ Recovery email is NOT asked during registration  
✅ Recovery email can be set in Account Settings  
✅ Forgot password asks for BOTH registered email AND recovery email  
✅ Reset link is sent to recovery email (check backend logs)  
✅ Reset link expires after 15 minutes  
✅ Password must meet strength requirements  
✅ After reset, old password no longer works  
✅ New password works for login  

## Troubleshooting

### "Invalid or expired link" on reset page
- Token may have expired (15 minutes)
- Request a new reset link

### "Too many reset requests" error
- You've requested more than 3 resets in 1 hour
- Wait 1 hour and try again
- (Requires Redis running)

### Email not received
- Gmail SMTP not configured in `application.properties`
- Check backend logs for reset link instead
- To enable email: Configure Gmail credentials in `application.properties`

### "Incorrect password" when setting recovery email
- You entered the wrong current password
- Try again with correct password

### "Recovery email does not match" on forgot password
- The recovery email you entered doesn't match the one set in account settings
- Go back to account settings to verify recovery email
- Or set a new recovery email

## API Endpoints (for manual testing)

### Request Password Reset
```bash
POST http://localhost:8080/api/password-reset/request
Content-Type: application/json

{
  "registeredEmail": "user@example.com",
  "recoveryEmail": "recovery@example.com"
}
```

### Validate Token
```bash
GET http://localhost:8080/api/password-reset/validate/{token}
```

### Reset Password
```bash
POST http://localhost:8080/api/password-reset/reset
Content-Type: application/json

{
  "token": "...",
  "newPassword": "NewPassword123!"
}
```

### Set Recovery Email
```bash
POST http://localhost:8080/api/account/set-recovery-email
Content-Type: application/json

{
  "userId": 1,
  "recoveryEmail": "recovery@example.com",
  "password": "currentPassword"
}
```

## Notes

- All passwords are hashed with BCrypt (10+ salt rounds)
- Reset tokens are 64-character cryptographically secure strings
- Tokens expire after exactly 15 minutes
- Each token can only be used once
- Rate limiting: 3 requests per hour per email AND per IP
- Same message shown for valid/invalid accounts (security best practice)
