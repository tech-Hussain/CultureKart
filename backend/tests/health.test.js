/**
 * Health Check Endpoint Tests
 */

const request = require('supertest');
const app = require('../app');

describe('Health Check Endpoint', () => {
  describe('GET /api/v1/health', () => {
    it('should return 200 OK status', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
    });

    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/v1/health')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });

    it('should return a valid timestamp', async () => {
      const response = await request(app).get('/api/v1/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should include API running message', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.body.message).toContain('CultureKart API');
      expect(response.body.message).toContain('running');
    });
  });
});
