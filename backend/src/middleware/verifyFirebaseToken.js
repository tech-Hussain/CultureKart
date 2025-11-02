/**
 * Firebase Token Verification Middleware
 * Verifies Firebase ID tokens and attaches user info to request
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Try to initialize with service account JSON file first (Option 1 - RECOMMENDED)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      const serviceAccount = require(serviceAccountPath);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('✅ Firebase Admin SDK initialized successfully (using service account file)');
    } catch (fileError) {
      console.warn('⚠️  Could not load service account file, trying environment variables...');
      
      // Fall back to individual environment variables (Option 2)
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        const serviceAccount = {
          type: process.env.FIREBASE_TYPE || 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
          token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
        };

        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        console.log('✅ Firebase Admin SDK initialized successfully (using environment variables)');
      } else {
        throw new Error('Firebase credentials not found in file or environment variables');
      }
    }
  } else {
    // No file path provided, try environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('✅ Firebase Admin SDK initialized successfully (using environment variables)');
    } else {
      throw new Error('Firebase credentials not configured. Please set FIREBASE_SERVICE_ACCOUNT_PATH or individual environment variables');
    }
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  console.warn('⚠️  Firebase authentication will not work without proper configuration');
  console.warn('📝 Please download service account JSON from Firebase Console > Project Settings > Service Accounts');
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
      email: decodedToken.email || null,
      name: decodedToken.name || decodedToken.displayName || null,
      picture: decodedToken.picture || null,
      emailVerified: decodedToken.email_verified || false,
      authProvider: 'firebase-oauth', // Add auth provider
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
