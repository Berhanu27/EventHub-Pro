# API Testing Commands for Password Reset Feature

## Prerequisites
- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:3000`

## Test Scenario (Step by Step)

### Step 1: Register a User
Use your existing registration endpoint or create a user directly in the database.

Example user:
- Email: `testuser@example.com`
- Password: `TestPassword123!`
- Name: `Test User`

### Step 2: Set Recovery Email

**Endpoint:** `POST http://localhost:8080/api/account/set-recovery-email`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "userId": 1,
  "recoveryEmail": "recovery@example.com",
  "password": "TestPassword123!"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Recovery email has been set successfully"
}
```

### Step 3: Request Password Reset

**Endpoint:** `POST http://localhost:8080/api/password-reset/request`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "registeredEmail": "testuser@example.com",
  "recoveryEmail": "recovery@example.com"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "If the account exists with matching recovery email, a reset link has been sent"
}
```

**Check Backend Logs:** Look for a line like:
```
Reset link: http://localhost:3000/reset-password?token=...
```

Copy the full token from the logs.

### Step 4: Validate Token

**Endpoint:** `GET http://localhost:8080/api/password-reset/validate/{token}`

Replace `{token}` with the token from Step 3.

**Expected Response (200 OK):**
```json
{
  "valid": true,
  "message": "Token is valid",
  "expiresAt": "2026-02-23T14:16:43.123456"
}
```

### Step 5: Reset Password

**Endpoint:** `POST http://localhost:8080/api/password-reset/reset`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "token": "...",
  "newPassword": "NewPassword456!"
}
```

Replace `...` with the token from Step 3.

**Expected Response (200 OK):**
```json
{
  "message": "Password has been successfully reset. Please login with your new password."
}
```

### Step 6: Test Invalid Scenarios

#### Invalid Recovery Email
**Endpoint:** `POST http://localhost:8080/api/password-reset/request`

**Body:**
```json
{
  "registeredEmail": "testuser@example.com",
  "recoveryEmail": "wrong@example.com"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "If the account exists with matching recovery email, a reset link has been sent"
}
```

Note: Same message as valid request (security best practice - doesn't reveal if account exists)

#### Invalid Token
**Endpoint:** `GET http://localhost:8080/api/password-reset/validate/invalid-token-here`

**Expected Response (200 OK):**
```json
{
  "valid": false,
  "message": "Invalid or expired link"
}
```

#### Weak Password
**Endpoint:** `POST http://localhost:8080/api/password-reset/reset`

**Body:**
```json
{
  "token": "...",
  "newPassword": "weak"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Password does not meet strength requirements"
}
```

## Using cURL

### Set Recovery Email
```bash
curl -X POST http://localhost:8080/api/account/set-recovery-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "recoveryEmail": "recovery@example.com",
    "password": "TestPassword123!"
  }'
```

### Request Password Reset
```bash
curl -X POST http://localhost:8080/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{
    "registeredEmail": "testuser@example.com",
    "recoveryEmail": "recovery@example.com"
  }'
```

### Validate Token
```bash
curl -X GET http://localhost:8080/api/password-reset/validate/YOUR_TOKEN_HERE
```

### Reset Password
```bash
curl -X POST http://localhost:8080/api/password-reset/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "newPassword": "NewPassword456!"
  }'
```

## Using Postman

1. Create a new collection called "Password Reset"
2. Add requests for each endpoint above
3. Use the token from the request password reset response in subsequent requests
4. Test both valid and invalid scenarios

## Frontend Testing

### 1. Go to Forgot Password Page
```
http://localhost:3000/forgot-password
```

Enter:
- Registered Email: `testuser@example.com`
- Recovery Email: `recovery@example.com`

Click "Send Reset Link"

### 2. Get Reset Link from Backend Logs
Check the backend console for the reset link

### 3. Go to Reset Password Page
```
http://localhost:3000/reset-password?token=YOUR_TOKEN_HERE
```

Enter:
- New Password: `NewPassword456!` (must meet strength requirements)
- Confirm Password: `NewPassword456!`

Click "Reset Password"

### 4. Login with New Password
```
http://localhost:3000/login
```

Enter:
- Email: `testuser@example.com`
- Password: `NewPassword456!`

## Password Requirements

Password must contain:
- ✅ 8 or more characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (@$!%*?&)

**Valid Examples:**
- `TestPassword123!`
- `MySecure@Pass99`
- `Secure#Password2`

**Invalid Examples:**
- `password123!` (no uppercase)
- `PASSWORD123!` (no lowercase)
- `TestPassword!` (no number)
- `TestPassword123` (no special char)
- `Test1!` (too short)

## Rate Limiting Test

Make 4 password reset requests within 1 hour:

**Request 1-3:** Should succeed (200 OK)

**Request 4:** Should fail with 429 Too Many Requests
```json
{
  "error": "Too many reset requests. Please try again in 1 hour"
}
```

Note: Requires Redis running for rate limiting to work

## Troubleshooting

### "No property 'loginEmail' found for type 'User'"
- This was fixed by removing the `findByLoginEmail()` method from UserRepository
- Recompile and restart the backend

### "Unable to connect to Redis"
- This is expected if Redis is not running
- Rate limiting will not work, but the API will still function
- To enable rate limiting, start Redis on localhost:6379

### "Gmail SMTP authentication failed"
- This is expected if Gmail credentials are not configured
- Email sending will not work, but the API will still function
- Check backend logs for reset link instead
- To enable email sending, configure Gmail SMTP in `application.properties`

### Token expired
- Tokens expire after 15 minutes
- Request a new reset link if token has expired

### "Invalid or expired link"
- Token may have expired (15 minutes)
- Token may have already been used
- Token may be invalid
- Request a new reset link
