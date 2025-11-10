# Email Verification System - CultureKart

This document explains the new OTP-based email verification system for users who register with email and password (not Firebase OAuth).

## 🚀 Features

- **Secure OTP Generation**: 6-digit random codes with 10-minute expiry
- **Rate Limiting**: Prevents spam by limiting OTP requests to once per minute
- **Attempt Limiting**: Maximum 5 verification attempts per OTP
- **Beautiful Email Templates**: Professional HTML emails with CultureKart branding
- **Welcome Emails**: Automatic welcome message after successful verification
- **Account Protection**: Unverified users cannot login until email is verified

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and generate a password
3. **Update .env file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Other Email Providers
You can use any SMTP provider by updating the EMAIL_HOST and EMAIL_PORT in your .env file.

## 🔑 API Endpoints

### 1. User Registration
**POST** `/api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "role": "buyer" // optional: user, buyer, artisan
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully! Please check your email for the verification code.",
  "requiresVerification": true,
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false
  }
}
```

### 2. Verify OTP
**POST** `/api/v1/auth/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Email verified successfully! Welcome to CultureKart.",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "buyer",
    "emailVerified": true,
    "isActive": true
  },
  "token": "jwt_token_here"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid OTP. 3 attempts remaining."
}
```

### 3. Resend OTP
**POST** `/api/v1/auth/resend-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email address"
}
```

### 4. Login (Updated)
**POST** `/api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (Unverified User):**
```json
{
  "success": false,
  "message": "Please verify your email address before logging in. Check your inbox for the verification code.",
  "emailVerified": false,
  "requiresVerification": true
}
```

## 🔒 Security Features

### 1. OTP Expiry
- OTPs expire after **10 minutes**
- Expired OTPs are automatically cleared

### 2. Attempt Limiting
- Maximum **5 attempts** per OTP
- After 5 failed attempts, user must request new OTP

### 3. Rate Limiting
- Users can only request new OTP every **1 minute**
- Prevents email spam and abuse

### 4. Account Protection
- Unverified users have `isActive: false`
- Cannot login until email verification is complete

## 📱 Frontend Integration

### Registration Flow
```javascript
// 1. Register user
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  })
});

// 2. Check if verification is required
const data = await registerResponse.json();
if (data.requiresVerification) {
  // Show OTP input form
  showOTPForm(data.user.email);
}
```

### OTP Verification
```javascript
// Verify OTP
const verifyResponse = await fetch('/api/v1/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: userEmail,
    otp: otpCode
  })
});

const result = await verifyResponse.json();
if (result.success) {
  // Save token and redirect to dashboard
  localStorage.setItem('token', result.token);
  redirectToDashboard();
} else {
  // Show error message
  showError(result.message);
}
```

### Resend OTP
```javascript
// Resend OTP with rate limiting
const resendOTP = async (email) => {
  try {
    const response = await fetch('/api/v1/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    if (data.success) {
      showSuccess('New verification code sent!');
      startResendTimer(); // Disable button for 60 seconds
    } else {
      showError(data.message);
    }
  } catch (error) {
    showError('Failed to resend code');
  }
};
```

## 🎨 Email Templates

### OTP Email Features
- **Beautiful HTML design** with CultureKart branding
- **Mobile responsive** layout
- **Clear OTP display** with large, easy-to-read font
- **Security warnings** and expiry information
- **Brand consistency** with gradient headers and styling

### Welcome Email
- Sent automatically after successful verification
- Introduces CultureKart features
- Encourages user engagement

## 🔧 Configuration Options

### Environment Variables
```env
# Email Service (Required)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: Custom sender name
EMAIL_FROM_NAME=CultureKart
```

### Customization
- OTP expiry time: Modify in `User.js` `generateEmailOTP()` method
- Attempt limits: Modify in `User.js` `verifyEmailOTP()` method
- Rate limiting: Modify in `User.js` `canRequestNewOTP()` method
- Email templates: Modify in `emailService.js`

## 🚨 Error Handling

The system handles various error scenarios:

1. **Invalid/Expired OTP**: Clear error messages with remaining attempts
2. **Too many attempts**: Forces new OTP request
3. **Rate limiting**: Prevents spam with time-based restrictions
4. **Email delivery failure**: Graceful degradation with user notification
5. **Already verified**: Prevents duplicate verification

## 📊 Monitoring

### Logs
- All OTP operations are logged with timestamps
- Email delivery status is tracked
- Failed verification attempts are recorded

### Database
- OTP data is stored securely in User model
- Automatic cleanup of expired OTPs
- Verification status tracking

## 🔄 Migration

### Existing Users
- Firebase OAuth users are **not affected**
- Only email/password users require verification
- Existing verified users maintain their status

### Backward Compatibility
- All existing endpoints remain functional
- New verification is only enforced for new registrations
- Firebase auth flow unchanged

## 📝 Testing

### Manual Testing
1. Register new user with email/password
2. Check email for OTP (check spam folder)
3. Verify with correct OTP
4. Try login before verification (should fail)
5. Verify and login (should succeed)
6. Test resend functionality
7. Test invalid OTP attempts

### Test Email Configuration
```bash
# In backend directory
node -e "require('./src/services/emailService').testEmailConfig()"
```

This comprehensive email verification system ensures that only legitimate users with verified email addresses can access your CultureKart platform! 🎉