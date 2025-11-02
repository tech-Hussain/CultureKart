# Device-Based Rate Limiting System

## Overview
The admin login system now uses **device fingerprinting** instead of IP addresses for rate limiting. This provides better security and prevents users from bypassing locks by changing their IP address.

## How It Works

### 1. Device Fingerprinting
When a user visits the admin login page, a unique device ID is generated using:
- User Agent
- Screen Resolution & Color Depth
- Timezone
- Language
- Hardware Concurrency (CPU cores)
- Device Memory
- Canvas Fingerprint
- WebGL Renderer Info
- Audio Context Properties
- Browser Features (Storage, IndexedDB, etc.)

All these properties are combined and hashed using SHA-256 to create a unique 64-character device ID.

### 2. Device ID Storage
- The device ID is stored in `localStorage` with the key `deviceId`
- Once generated, it persists across page reloads and browser sessions
- To see your device ID, open browser console and look for: `🆔 Device ID initialized`

### 3. Rate Limiting Rules
- **3 failed login attempts** from the same device = **5-minute lock**
- Failed attempts include:
  - Wrong email
  - Wrong password
  - Invalid authentication method
- Lock persists even if correct credentials are provided (prevents brute force)
- Lock expires automatically after 5 minutes

### 4. Visual Feedback
- **Countdown Timer**: Shows remaining lock time in MM:SS format
- **Disabled Inputs**: Email, password, and login button are disabled during lock
- **Yellow Alert Box**: Displays lock message with clock icon
- **Attempt Warnings**: Shows remaining attempts before lock (e.g., "2 attempts remaining")

## Key Features

### Device Fingerprinting Utility
**File**: `frontend/src/utils/deviceFingerprint.js`

```javascript
import { getDeviceId } from '../utils/deviceFingerprint';

// Get or generate device ID
const deviceId = await getDeviceId();
```

### Backend Model Updates
**File**: `backend/src/models/AdminLoginAttempt.js`

- Added `deviceId` field (required, indexed)
- Changed `ipAddress` to optional (kept for logging)
- New method: `getRecentFailedAttemptsByDevice(deviceId)`
- New method: `isDeviceLocked(deviceId)`
- Updated `logAttempt()` to track by device ID

### Middleware Updates
**File**: `backend/src/middleware/adminLoginRateLimit.js`

- Checks `deviceId` in request body
- Uses `isDeviceLocked()` instead of `isIPLocked()`
- Returns 429 status with lock info if device is locked
- All helper functions now require `deviceId` parameter

### API Changes
**Endpoint**: `POST /api/v1/auth/login`

**Required Fields**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "deviceId": "a1b2c3d4e5f6..." // New required field
}
```

**Error Response (Device Locked)**:
```json
{
  "success": false,
  "message": "Too many failed login attempts from this device. Please try again in 5 minutes.",
  "locked": true,
  "lockUntil": "2025-11-02T14:30:00.000Z",
  "remainingTime": 285
}
```

## Management Scripts

### Unlock Device
**File**: `backend/unlockDevice.js`

Manually unlock a device by its device ID:

```bash
cd backend
node unlockDevice.js <DEVICE_ID>
```

Example:
```bash
node unlockDevice.js a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### View Login Attempts
**File**: `backend/viewLoginAttempts.js`

View all login attempts with device information:

```bash
cd backend
node viewLoginAttempts.js
```

### Clear All Attempts
**File**: `backend/clearAttempts.js`

Clear all login attempt records:

```bash
cd backend
node clearAttempts.js
```

## Testing the System

### Test Device Lock
1. Open admin login page: `http://localhost:5173/admin-login`
2. Check browser console for device ID: `🆔 Device ID initialized`
3. Try logging in with wrong credentials 3 times
4. On 3rd attempt, device will be locked for 5 minutes
5. Timer will appear showing remaining time
6. Try refreshing page - timer should persist

### Test Lock Persistence
1. Get locked (3 failed attempts)
2. Try logging in with **correct** credentials
3. Login will still be blocked (persistent lock)
4. Wait 5 minutes or use unlock script

### Test Device Uniqueness
1. Open login page in Chrome - note device ID
2. Open same page in Firefox - different device ID
3. Each browser gets its own device ID
4. Changing IP address won't change device ID

## Browser Compatibility

The device fingerprinting system works on all modern browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Brave

**Note**: Some privacy-focused browsers (like Brave with strict fingerprinting protection) may generate different device IDs on each visit. This is expected behavior.

## Security Considerations

### Advantages Over IP-Based Locking
1. **Bypassing Prevention**: Users can't bypass lock by changing IP (VPN, mobile network)
2. **Multi-User Environments**: Multiple users behind same IP (office, school) won't be locked together
3. **Mobile Networks**: Users on mobile networks with dynamic IPs won't lose lock state

### Privacy
- Device ID is generated client-side
- No personal information is collected
- Device ID cannot be traced back to individual users
- Only stored in localStorage and MongoDB

### Limitations
1. **Incognito Mode**: Each incognito session generates new device ID
2. **Clear Browser Data**: Clearing localStorage removes device ID
3. **Browser Fingerprinting Protection**: Privacy tools may interfere

## Migration from IP-Based to Device-Based

### Database Schema Changes
The `AdminLoginAttempt` model now has:
- `deviceId`: String, required, indexed
- `ipAddress`: String, optional (kept for logging)

### Existing Data
Old records with only `ipAddress` will still exist but won't affect new device-based locks.

### Backward Compatibility
The system requires `deviceId` in all new login requests. Requests without `deviceId` will be rejected with 400 status.

## Troubleshooting

### "Device ID is required" Error
- Browser console shows: `🆔 Device ID initialized`?
- If not, check `deviceFingerprint.js` import
- Clear browser cache and reload

### Timer Not Showing After Lock
- Check browser console for: `🔒 LOCK DETECTED - Setting lock state`
- Verify `isLocked`, `lockEndTime`, `remainingTime` states
- Check API response includes `locked: true`

### Lock Not Persisting on Reload
- Device ID should be same after reload
- Check localStorage: `localStorage.getItem('deviceId')`
- Check backend console: `📊 Login attempt for <email> from device <deviceId>`

### Device ID Changes on Every Visit
- This happens with:
  - Incognito/Private mode
  - Browser fingerprinting protection enabled
  - Clearing localStorage/cookies
- Solution: Use normal browser mode for testing

## API Documentation

### Check Device Lock Status
Currently, checking lock status requires attempting login with dummy credentials. A dedicated endpoint can be added:

```javascript
// Future endpoint (not implemented yet)
GET /api/v1/auth/check-device-lock
Headers: { "X-Device-ID": "<device_id>" }

Response:
{
  "locked": true,
  "lockUntil": "2025-11-02T14:30:00.000Z",
  "remainingTime": 285
}
```

## Console Logs for Debugging

### Frontend
- `🆔 Device ID initialized` - Device ID generated/loaded
- `🆔 Using existing device ID: a1b2c3...` - Found in localStorage
- `🔒 Device is locked on page load` - Lock detected on mount
- `🔒 LOCK DETECTED - Setting lock state` - Lock triggered by failed login
- `Timer update - timeLeft: 285` - Countdown timer tick

### Backend
- `📊 Login attempt for <email> from device <deviceId>` - Attempt logged
- `   Recent failed attempts from device: 2` - Attempt count
- `   New attempt number: 3` - Current attempt
- `🔒 LOCKING DEVICE - lockUntil: <date>` - Device locked

## Future Enhancements

1. **Device Management Dashboard**
   - Show all locked devices
   - Manual unlock from admin panel
   - View device fingerprints

2. **Device Recognition**
   - Show "New device detected" warnings
   - Email notifications for new device logins
   - Remember trusted devices

3. **Advanced Fingerprinting**
   - Battery API
   - Network Information API
   - WebRTC local IP detection
   - More canvas variations

4. **Lock Status Endpoint**
   - Dedicated API to check lock without logging attempt
   - Faster page load (no dummy request needed)

## Summary

✅ **Device-based rate limiting implemented**
✅ **Unique device fingerprinting system**
✅ **Persistent lock (can't bypass with correct credentials)**
✅ **Visual countdown timer**
✅ **State persists across page reloads**
✅ **Management scripts for unlocking devices**
✅ **Comprehensive logging and debugging**

The system now provides robust security by locking devices instead of IP addresses, making it much harder for attackers to bypass rate limits.
