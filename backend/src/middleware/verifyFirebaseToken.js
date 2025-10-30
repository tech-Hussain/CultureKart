/**
 * Firebase Token Verification Middleware
 * Verifies Firebase ID tokens and attaches user info to request
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
  const serviceAccount = require(path.resolve(serviceAccountPath));

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  console.warn('⚠️  Firebase authentication will not work without proper configuration');
}

/**
 * Middleware to verify Firebase ID token
 * Expects Authorization : Bearer <idToken>
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Authorization header must be: Bearer <token>',
      });
    }

    // Get the token (remove 'Bearer ' prefix)
    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token format',
      });
    }

    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.emailheader || null,
      name: decodedToken.name || decodedToken.displayName || null,
      picture: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);

    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired. Please sign in again.',
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has been revoked. Please sign in again.',
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token format',
      });
    }

    // Generic invalid token error
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

module.exports = verifyFirebaseToken;
