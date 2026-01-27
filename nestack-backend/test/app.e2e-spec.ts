import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestContext } from './test-utils';

describe('AppController (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('Health Check', () => {
    it('should return 404 for root path (API prefix is /api/v1)', async () => {
      // The app uses /api/v1 prefix, so root should return 404
      await request(app.getHttpServer())
        .get('/')
        .expect(404);
    });

    it('should have proper CORS headers', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/auth/login')
        .expect(204);

      // CORS headers should be present
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('API Versioning', () => {
    it('should respond to /api/v1 prefixed routes', async () => {
      // Auth login should be accessible
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      // Should get 401 (invalid credentials), not 404 (route not found)
      expect(response.status).toBe(401);
    });

    it('should return 404 for non-prefixed routes', async () => {
      await request(app.getHttpServer())
        .get('/auth/login')
        .expect(404);
    });
  });

  describe('Global Validation Pipe', () => {
    it('should validate request body and strip unknown properties', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email', // Invalid email format
          password: 'password123',
          unknownField: 'should be stripped',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject requests with missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Global Response Format', () => {
    it('should wrap successful responses in standard format', async () => {
      // Create a test user and check response format
      const email = `test-${Date.now()}@example.com`;

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email,
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should wrap error responses in standard format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication Guard', () => {
    it('should allow access to public endpoints without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      // Should get 401 (invalid credentials), not 403 (forbidden)
      expect(response.status).toBe(401);
    });

    it('should reject access to protected endpoints without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject access with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'invalid-format')
        .expect(401);
    });
  });
});
