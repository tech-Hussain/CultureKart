# Dual Authentication System

## Overview

CultureKart now supports **two authentication methods**:

1. **Firebase OAuth** - Sign in with Google
2. **Email/Password** - Traditional authentication with JWT tokens

Users can register and login using either method. Once registered with one method, they must continue using that same method.

---

## 🔐 Authentication Methods

### Method 1: Firebase OAuth (Google Sign-In)

**How it works:**
- User clicks "Sign in with Google"
- Firebase handles OAuth flow
- Backend receives Firebase ID token
- User profile stored with `authProvider: 'firebase-oauth'`

**Token Type:** Firebase ID Token (long-lived, refreshable)

**Frontend:**
```javascript
import { signInWithGoogle } from '../services/authService';

const handleGoogleLogin = async () => {
  const userData = await signInWithGoogle();
  // userData contains: uid, email, displayName, photoURL, token
};
```

**Backend Endpoint:** `POST /api/v1/auth/verify`
- **Headers:** `Authorization: Bearer <firebaseIdToken>`
- **Response:** User profile with role

---

### Method 2: Email/Password Authentication

**How it works:**
- User provides email, password, and name
- Backend hashes password with bcrypt
- JWT token generated and returned
- User profile stored with `authProvider: 'email-password'`

**Token Type:** JWT (7-day expiration)

**Frontend - Registration:**
```javascript
import { registerWithEmail } from '../services/authService';

const handleRegister = async () => {
  const userData = await registerWithEmail({
    email: 'user@example.com',
    password: 'SecurePass123',
    name: 'John Doe',
    role: 'buyer' // or 'artisan'
  });
  // userData contains: user object and JWT token
};
```

**Backend Endpoint:** `POST /api/v1/auth/register`
- **Body:** `{ email, password, name, role }`
- **Response:** User profile + JWT token

**Frontend - Login:**
```javascript
import { signInWithEmail } from '../services/authService';

const handleLogin = async () => {
  const userData = await signInWithEmail('user@example.com', 'password');
  // userData contains: user object and JWT token
};
```

**Backend Endpoint:** `POST /api/v1/auth/login`
- **Body:** `{ email, password }`
- **Response:** User profile + JWT token

---

## 📊 User Schema

The User model now includes:

```javascript
{
  firebaseUid: String,        // Optional (for Firebase OAuth users)
  email: String,              // Required, unique
  password: String,           // Optional (for email/password users) - hashed with bcrypt
  authProvider: String,       // 'firebase-oauth' or 'email-password'
  name: String,
  role: String,               // 'user', 'buyer', 'artisan', 'admin'
  profile: {
    bio: String,
    location: String,
    phone: String,
    avatar: String
  },
  emailVerified: Boolean,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Key Changes:**
- `firebaseUid` is now **optional** (sparse index allows multiple null values)
- `password` field added with `select: false` (excluded from queries by default)
- `authProvider` field tracks which method user registered with

---

## 🔧 Backend Implementation

### New Middleware

#### 1. `verifyJWT.js`
Verifies JWT tokens for email/password users
```javascript
const verifyJWT = require('../middleware/verifyJWT');
router.get('/protected', verifyJWT, (req, res) => {
  // req.user contains: { userId, email, role, authProvider }
});
```

#### 2. `authenticate.js` (Unified)
Automatically detects and verifies both Firebase and JWT tokens
```javascript
const { authenticate } = require('../middleware/authenticate');
router.get('/profile', authenticate, (req, res) => {
  // Works with both Firebase OAuth and Email/Password
});
```

### Authentication Routes

| Method | Endpoint | Auth Type | Description |
|--------|----------|-----------|-------------|
| POST | `/api/v1/auth/register` | None | Register with email/password |
| POST | `/api/v1/auth/login` | None | Login with email/password |
| POST | `/api/v1/auth/verify` | Firebase | Verify Firebase token (Google sign-in) |
| GET | `/api/v1/auth/profile` | Both | Get current user profile |
| PATCH | `/api/v1/auth/profile` | Both | Update user profile |

---

## 🎨 Frontend Implementation

### AuthService Methods

```javascript
// services/authService.js

// Firebase OAuth
signInWithGoogle()          // Google sign-in
signOutUser()               // Sign out (both methods)

// Email/Password
registerWithEmail(userData) // Register new user
signInWithEmail(email, pwd) // Login existing user

// Utilities
onAuthStateChange(callback) // Listen to auth changes
getCurrentUserProfile()     // Get profile from backend
getCurrentUserToken()       // Get current token
```

### Updated Pages

#### Login.jsx
- Supports both Google and email/password login
- Detects auth provider and routes accordingly
- Shows appropriate error messages

#### Signup.jsx
- Supports both Google and email/password registration
- Role selection (buyer/artisan) during signup
- Validates password strength (min 6 characters)

---

## 🔒 Security Features

### Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Validation:** Minimum 6 characters (customizable)
- **Storage:** Password field excluded from default queries (`select: false`)

### Token Security
- **JWT:** 7-day expiration, signed with secret key
- **Firebase:** Google-managed, auto-refreshed
- **Storage:** Tokens stored in localStorage with key `authToken`

### Cross-Method Protection
- Email/password users **cannot** login with Firebase OAuth
- Firebase users **cannot** login with email/password
- Clear error messages guide users to correct method

---

## 🚀 Usage Examples

### Example 1: Register with Email/Password

```javascript
// Frontend
const handleSignup = async (e) => {
  e.preventDefault();
  try {
    const user = await registerWithEmail({
      email: 'artisan@culturekart.com',
      password: 'SecurePassword123',
      name: 'Jane Smith',
      role: 'artisan'
    });
    
    console.log('Registered:', user);
    navigate('/artisan/dashboard');
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
```

### Example 2: Login with Email/Password

```javascript
// Frontend
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const user = await signInWithEmail(email, password);
    
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

### Example 3: Making Authenticated Requests

```javascript
// Frontend - Token is automatically included by api.js
import api from '../api/api';

// Works with both auth methods
const response = await api.get('/auth/profile');
const user = response.data.user;

// Update profile
await api.patch('/auth/profile', {
  name: 'New Name',
  profile: {
    bio: 'Updated bio',
    location: 'New City'
  }
});
```

---

## 🧪 Testing the System

### Test Email/Password Registration

```bash
# Using curl
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "buyer"
  }'

# Expected Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Email/Password Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected Response:
{
  "success": true,
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Test Protected Route

```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Expected Response:
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "buyer",
    "authProvider": "email-password",
    ...
  }
}
```

---

## 🔄 Migration Notes

### Existing Firebase Users
- Existing users with `firebaseUid` will continue to work
- No migration needed for Firebase OAuth users
- They will have `authProvider: 'firebase-oauth'`

### New Users
- Can choose either authentication method
- Cannot switch methods after registration
- Email must be unique across both methods

---

## 📝 Environment Variables

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Firebase Configuration (existing)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

**⚠️ Important:** Change `JWT_SECRET` to a strong, random string in production!

---

## 🆘 Troubleshooting

### Error: "This account uses Firebase authentication"
- **Cause:** Trying to login with email/password for a Google account
- **Solution:** Use "Sign in with Google" button instead

### Error: "User with this email already exists"
- **Cause:** Email already registered
- **Solution:** Use login instead of signup

### Error: "Invalid email or password"
- **Cause:** Wrong credentials or user doesn't exist
- **Solution:** Check credentials or register first

### Error: "Token has expired"
- **Cause:** JWT token expired (7 days)
- **Solution:** Login again to get new token

---

## ✅ Summary

**Firebase OAuth:**
- ✅ Sign in with Google
- ✅ Firebase manages tokens
- ✅ Photo and name auto-populated
- ✅ No password needed

**Email/Password:**
- ✅ Traditional signup/login
- ✅ JWT tokens (7-day expiration)
- ✅ bcrypt password hashing
- ✅ Full control over user data

**Both Methods:**
- ✅ Same User model
- ✅ Same profile API endpoints
- ✅ Role-based access control
- ✅ Secure and isolated

Your app now offers users flexibility in how they authenticate! 🎉
