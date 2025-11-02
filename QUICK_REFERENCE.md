# 🚀 Quick Reference - Dual Authentication

## API Endpoints

### Email/Password Authentication

```bash
# Register
POST /api/v1/auth/register
Body: { email, password, name, role }
Response: { success, user, token }

# Login  
POST /api/v1/auth/login
Body: { email, password }
Response: { success, user, token }
```

### Firebase OAuth

```bash
# Verify Google Sign-In
POST /api/v1/auth/verify
Headers: Authorization: Bearer <firebaseIdToken>
Response: { success, user }
```

### Common (Both Methods)

```bash
# Get Profile
GET /api/v1/auth/profile
Headers: Authorization: Bearer <token>
Response: { success, user }

# Update Profile
PATCH /api/v1/auth/profile  
Headers: Authorization: Bearer <token>
Body: { name?, profile? }
Response: { success, user }
```

---

## Frontend Usage

### Register

```javascript
import { registerWithEmail } from '../services/authService';

const user = await registerWithEmail({
  email: 'user@example.com',
  password: 'Password123',
  name: 'User Name',
  role: 'buyer'
});
```

### Login

```javascript
import { signInWithEmail } from '../services/authService';

const user = await signInWithEmail('user@example.com', 'Password123');
```

### Google Sign-In

```javascript
import { signInWithGoogle } from '../services/authService';

const user = await signInWithGoogle();
```

### Get Current User

```javascript
import { getCurrentUserProfile } from '../services/authService';

const user = await getCurrentUserProfile();
```

### Sign Out

```javascript
import { signOutUser } from '../services/authService';

await signOutUser();
```

---

## Backend Middleware

### Unified Authentication (Recommended)

```javascript
const { authenticate } = require('../middleware/authenticate');

// Works with both Firebase and JWT
router.get('/protected', authenticate, (req, res) => {
  // req.user available here
  res.json({ user: req.user });
});
```

### JWT Only

```javascript
const verifyJWT = require('../middleware/verifyJWT');

router.get('/jwt-only', verifyJWT, (req, res) => {
  // Only JWT tokens accepted
});
```

### Firebase Only

```javascript
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

router.get('/firebase-only', verifyFirebaseToken, (req, res) => {
  // Only Firebase tokens accepted
});
```

---

## User Object Structure

```javascript
{
  id: "507f1f77bcf86cd799439011",
  email: "user@example.com",
  name: "User Name",
  role: "buyer", // or "artisan", "admin"
  authProvider: "email-password", // or "firebase-oauth"
  profile: {
    bio: "My bio",
    location: "City, Country",
    phone: "+1234567890",
    avatar: "https://..."
  },
  emailVerified: false,
  isActive: true,
  lastLogin: "2025-11-02T10:30:00.000Z",
  createdAt: "2025-11-01T08:00:00.000Z"
}
```

---

## Error Handling

### Common Errors

| Status | Error | Meaning |
|--------|-------|---------|
| 400 | "Email and password are required" | Missing fields |
| 400 | "User with this email already exists" | Duplicate email |
| 400 | "This account uses Firebase authentication" | Wrong auth method |
| 401 | "Invalid email or password" | Wrong credentials |
| 401 | "Token has expired" | JWT expired (7 days) |
| 403 | "Your account has been deactivated" | Account disabled |

### Frontend Error Handling

```javascript
try {
  const user = await signInWithEmail(email, password);
  // Success
} catch (error) {
  if (error.message.includes('Invalid email or password')) {
    // Show error message
  } else if (error.message.includes('Firebase authentication')) {
    // Redirect to Google sign-in
  }
}
```

---

## Token Storage

### Frontend (localStorage)

```javascript
// Token automatically stored by authService
localStorage.getItem('authToken'); // JWT or Firebase token

// Clear on logout
localStorage.removeItem('authToken');
```

### API Requests

```javascript
import api from '../api/api';

// Token automatically included in all requests
api.get('/auth/profile'); // Authorization header added automatically
```

---

## Database Queries

### Find User by Email

```javascript
const user = await User.findByEmail('user@example.com');
```

### Find User by Firebase UID

```javascript
const user = await User.findByFirebaseUid('firebase-uid-123');
```

### Find Users by Role

```javascript
const artisans = await User.findByRole('artisan');
```

### Check Auth Provider

```javascript
if (user.usesEmailPassword()) {
  // Email/password user
} else {
  // Firebase OAuth user
}
```

---

## Security Checklist

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens expire in 7 days
- ✅ Password field excluded from queries
- ✅ Cross-method protection (can't mix auth types)
- ✅ Minimum password length: 6 characters
- ✅ Email validation
- ✅ Active account check
- ✅ Token verification on all protected routes

---

## Testing Commands

### Test Registration

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123","name":"Test","role":"buyer"}'
```

### Test Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}'
```

### Test Get Profile

```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Run Automated Tests

```bash
node backend/scripts/testEmailAuth.js
```

---

## Environment Setup

### Required Variables

```env
# Backend .env
JWT_SECRET=your-secret-key-min-32-characters-long
MONGODB_URI=mongodb+srv://...
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### Check Configuration

```bash
# Backend
npm run dev

# Should see:
✅ Firebase Admin SDK initialized successfully
✅ MongoDB Connected
🚀 Server running on port 5000
```

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "User already exists" | Use login endpoint instead |
| "Invalid token" | Re-login to get new token |
| "Token expired" | Re-login (tokens last 7 days) |
| "CORS error" | Check backend CORS configuration |
| "Cannot read property..." | Ensure backend is running |
| Password not working | Check bcrypt is installed |

---

## File Locations

```
backend/
├── src/
│   ├── models/User.js              # Updated schema
│   ├── routes/auth.js              # All auth endpoints
│   ├── middleware/
│   │   ├── verifyJWT.js            # JWT verification
│   │   ├── verifyFirebaseToken.js  # Firebase verification
│   │   └── authenticate.js         # Unified auth
│   └── ...
└── scripts/
    └── testEmailAuth.js            # Test script

frontend/
├── src/
│   ├── services/authService.js     # Auth functions
│   ├── pages/
│   │   ├── Login.jsx              # Login page
│   │   └── Signup.jsx             # Signup page
│   └── ...
└── ...
```

---

## Dependencies

### Backend (Already Installed)

```json
{
  "bcryptjs": "^3.0.2",
  "jsonwebtoken": "^9.0.2",
  "firebase-admin": "^13.5.0",
  "mongoose": "^8.19.2"
}
```

### Frontend

```json
{
  "firebase": "^11.2.0",
  "axios": "^1.13.0"
}
```

---

**📚 For full documentation, see:**
- `DUAL_AUTHENTICATION_GUIDE.md` - Complete technical guide
- `DUAL_AUTH_SUMMARY.md` - Feature summary

**🎉 Your dual authentication system is ready to use!**
