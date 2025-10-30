/**
 * Authentication Verification Tests
 * Tests Firebase token verification middleware
 */

const request = require('supertest');
const app = require('../app');
const admin = require('firebase-admin');

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const mockAuth = {
    verifyIdToken: jest.fn(),
  };

  return {
    auth: jest.fn(() => mockAuth),
    credential: {
      cert: jest.fn(),
    },
    initializeApp: jest.fn(),
  };
});

describe('Authentication Verification', () => {
  let mockAuth;

  beforeAll(() => {
    mockAuth = admin.auth();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/verify', () => {
    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/authorization header/i);
    });

    it('should return 401 with invalid token format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/verify')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 with expired token', async () => {
      mockAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/id-token-expired',
        message: 'Firebase ID token has expired',
      });

      const response = await request(app)
        .post('/api/v1/auth/verify')
        .set('Authorization', 'Bearer expired_token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('expired_token');
    });

    it('should return 401 with invalid token', async () => {
      mockAuth.verifyIdToken.mockRejectedValue({
        code: 'auth/argument-error',
        message: 'Invalid token',
      });

      const response = await request(app)
        .post('/api/v1/auth/verify')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should verify valid token and return user profile', async () => {
      // Mock successful token verification
      const mockDecodedToken = {
        uid: 'test_uid_12345',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
        email_verified: true,
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const response = await request(app)
        .post('/api/v1/auth/verify')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', mockDecodedToken.email);
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid_token');
    });

    it('should create new user for first-time login', async () => {
      const mockDecodedToken = {
        uid: 'new_user_uid_99999',
        email: 'newuser@example.com',
        name: 'New User',
        email_verified: true,
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const response = await request(app)
        .post('/api/v1/auth/verify')
        .set('Authorization', 'Bearer valid_new_user_token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toHaveProperty('email', mockDecodedToken.email);
      expect(response.body.user).toHaveProperty('role', 'buyer'); // Default role
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return 401 without authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should return user profile with valid token', async () => {
      const mockDecodedToken = {
        uid: 'test_uid_12345',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true,
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      // First create/verify user
      await request(app)
        .post('/api/v1/auth/verify')
        .set('Authorization', 'Bearer valid_token');

      // Then get profile
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer valid_token')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('role');
    });
  });

  describe('PATCH /api/v1/auth/profile', () => {
    it('should update user profile with valid token', async () => {
      const mockDecodedToken = {
        uid: 'test_uid_12345',
        email: 'test@example.com',
        name: 'Test User',
        email_verified: true,
      };

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      // First create/verify user
      await request(app)
        .post('/api/v1/auth/verify')
        .set('Authorization', 'Bearer valid_token');

      // Update profile
      const updateData = {
        name: 'Updated Name',
        profile: {
          bio: 'Updated bio',
          location: 'Karachi, Pakistan',
        },
      };

      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', 'Bearer valid_token')
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.user).toHaveProperty('name', updateData.name);
      expect(response.body.user.profile).toHaveProperty('bio', updateData.profile.bio);
      expect(response.body.user.profile).toHaveProperty('location', updateData.profile.location);
    });

    it('should return 401 without authorization', async () => {
      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
