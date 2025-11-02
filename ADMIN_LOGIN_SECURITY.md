# Admin Login Security System

## Overview
The admin login system includes comprehensive security features to protect against brute-force attacks and unauthorized access.

## Features

### 1. **Rate Limiting**
- Maximum **3 failed login attempts** allowed
- After 3 failed attempts, account is locked for **5 minutes**
- Lock is applied per email address
- Automatic unlock after lock period expires

### 2. **Logging & Monitoring**
All admin login attempts are logged to MongoDB with:
- ✅ Email address
- ✅ IP address
- ✅ User agent
- ✅ Timestamp
- ✅ Success/failure status
- ✅ Failure reason
- ✅ Lock status

### 3. **Security Messages**
Users receive clear feedback:
- **Attempt 1 failed:** "Invalid email or password. 2 attempts remaining before account lock."
- **Attempt 2 failed:** "Invalid email or password. 1 attempt remaining before account lock."
- **Attempt 3 failed:** "Too many failed login attempts. Your account has been locked for 5 minutes."
- **While locked:** "Account temporarily locked due to multiple failed login attempts. Please try again in X minutes and Y seconds."

## Database Schema

### AdminLoginAttempt Model
```javascript
{
  email: String,              // Admin email (indexed)
  ipAddress: String,          // IP address of attempt
  userAgent: String,          // Browser/client info
  success: Boolean,           // true = success, false = failed
  failureReason: String,      // 'invalid_credentials', 'account_locked', etc.
  lockUntil: Date,           // Lock expiration time (null if not locked)
  attemptNumber: Number,      // Sequential attempt number
  createdAt: Date,           // Timestamp (auto-generated)
  updatedAt: Date            // Timestamp (auto-generated)
}
```

### Indexes
- `{ email: 1, createdAt: -1 }` - Query recent attempts by email
- `{ ipAddress: 1, createdAt: -1 }` - Query attempts by IP
- `{ createdAt: 1 }` with TTL - Auto-delete records after 30 days

## Failure Reasons

| Reason | Description |
|--------|-------------|
| `invalid_credentials` | Wrong password |
| `user_not_found` | Email doesn't exist |
| `account_locked` | Attempted login while locked |
| `not_admin` | User doesn't have admin role |
| `invalid_token` | Invalid authentication token |
| `server_error` | Internal server error |

## API Endpoints

### POST /api/v1/auth/login
Login with email and password. Includes rate limiting for admin accounts.

**Request:**
```json
{
  "email": "admin@culturekart.com",
  "password": "your-password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": { ... },
  "token": "jwt-token"
}
```

**Failed Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password. 2 attempts remaining before account lock.",
  "remainingAttempts": 2
}
```

**Locked Response (429):**
```json
{
  "success": false,
  "message": "Account temporarily locked due to multiple failed login attempts. Please try again in 5 minutes.",
  "locked": true,
  "lockUntil": "2025-11-02T12:36:07.000Z",
  "remainingTime": 300
}
```

## Management Scripts

### 1. View Login Attempts
```bash
node viewLoginAttempts.js
```
Shows:
- Last 20 login attempts
- Statistics (total, successful, failed attempts)
- Unique IP addresses
- Current lock status

### 2. Unlock Account
```bash
node unlockAccount.js <email>
```
Example:
```bash
node unlockAccount.js admin@culturekart.com
```

Manually clears the lock on an admin account.

## Implementation Details

### Middleware: `checkAdminLoginLock`
- Runs **before** authentication
- Checks if account is currently locked
- Returns 429 (Too Many Requests) if locked
- Attaches login info to `req.adminLoginInfo`

### Helper Functions

**`logSuccessfulLogin(email, req)`**
- Called after successful login
- Records successful attempt
- Tracks IP and user agent

**`logFailedLogin(email, req, failureReason)`**
- Called after failed login
- Records failed attempt
- Checks if lock should be triggered
- Returns lock status

## Security Best Practices

### Frontend
✅ Admin email placeholder: "Enter admin email"
✅ Display remaining attempts to user
✅ Show lock timer when account is locked
✅ Clear error messages

### Backend
✅ Rate limiting per email
✅ Comprehensive logging
✅ IP address tracking
✅ User agent tracking
✅ Automatic unlock after 5 minutes
✅ Manual unlock capability

## Testing

### Test Rate Limiting
```bash
node testRateLimit.js
```

This script:
1. Makes 3 failed login attempts
2. Triggers account lock
3. Attempts login while locked
4. Confirms lock is enforced

### Test Flow
1. ❌ First failed attempt → "2 attempts remaining"
2. ❌ Second failed attempt → "1 attempt remaining"
3. ❌ Third failed attempt → Account locked for 5 minutes
4. ❌ Fourth attempt (even with correct password) → Still locked

## Monitoring

### View Recent Activity
```bash
node viewLoginAttempts.js
```

### Check Specific Account
Query the database:
```javascript
await AdminLoginAttempt.getStatistics('admin@culturekart.com', 7);
```

Returns:
- Total attempts (last 7 days)
- Successful attempts
- Failed attempts
- Unique IP addresses

### Check Lock Status
```javascript
const lockStatus = await AdminLoginAttempt.isAccountLocked('admin@culturekart.com');
```

Returns:
```javascript
{
  locked: true/false,
  lockUntil: Date,
  remainingTime: seconds
}
```

## Configuration

### Change Lock Duration
In `src/models/AdminLoginAttempt.js`:
```javascript
// Current: 5 minutes
attemptData.lockUntil = new Date(Date.now() + 5 * 60 * 1000);

// Change to 10 minutes:
attemptData.lockUntil = new Date(Date.now() + 10 * 60 * 1000);
```

### Change Max Attempts
In `src/models/AdminLoginAttempt.js`:
```javascript
// Current: 3 attempts
if (attemptData.attemptNumber >= 3) {

// Change to 5 attempts:
if (attemptData.attemptNumber >= 5) {
```

Also update in `src/routes/auth.js`:
```javascript
const remainingAttempts = 3 - failureInfo.attemptNumber;
// Change to:
const remainingAttempts = 5 - failureInfo.attemptNumber;
```

### Change Log Retention
In `src/models/AdminLoginAttempt.js`:
```javascript
// Current: 30 days
adminLoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Change to 90 days:
adminLoginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

## Troubleshooting

### Account Stuck Locked
```bash
node unlockAccount.js admin@culturekart.com
```

### Can't See Attempts
Check database connection:
```bash
node viewLoginAttempts.js
```

### Rate Limiting Not Working
1. Check middleware is applied to route:
```javascript
router.post('/login', checkAdminLoginLock, async (req, res) => {
```

2. Check database connection
3. Restart backend server

## Production Recommendations

1. **Enable Email Alerts**
   - Send email after 3 failed attempts
   - Notify admins of suspicious activity

2. **IP Blocking**
   - Block IPs with excessive failed attempts
   - Implement IP-based rate limiting

3. **Two-Factor Authentication**
   - Add 2FA for admin accounts
   - Use TOTP or SMS verification

4. **Session Management**
   - Implement session expiry
   - Force re-login after inactivity

5. **Audit Dashboard**
   - Create admin panel to view attempts
   - Real-time monitoring
   - Export logs for compliance

## Admin Credentials

**Email:** `admin@culturekart.com`  
**Password:** `Admin@123456`  
**Role:** `admin`

⚠️ **IMPORTANT:** Change the default password in production!

## Support

For issues or questions, contact the development team.
