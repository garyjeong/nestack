import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  generateTestData,
  TestContext,
  TestUser,
} from './test-utils';

describe('AuthController (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should register a new user successfully', async () => {
      const userData = generateTestData();

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.name).toBe(userData.name);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with duplicate email', async () => {
      const userData = generateTestData();

      // First signup
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      // Second signup with same email
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    let testUserData: ReturnType<typeof generateTestData>;

    beforeAll(async () => {
      testUserData = generateTestData();
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(testUserData);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUserData.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let testUser: TestUser;

    beforeAll(async () => {
      testUser = await createTestUser(app);
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: testUser.refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      // TokenResponseDto: { accessToken, refreshToken, tokenType, expiresIn }
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('tokenType');
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      const testUser = await createTestUser(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({ refreshToken: testUser.refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logout successful');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({})
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/password/forgot', () => {
    it('should accept request for existing email', async () => {
      const testUser = await createTestUser(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/password/forgot')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toContain('Password reset email sent');
    });

    it('should accept request for non-existing email (no information disclosure)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/password/forgot')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/password/forgot')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/verify-email/resend', () => {
    it('should accept request for existing email', async () => {
      const testUser = await createTestUser(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email/resend')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email/resend')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/verify-email', () => {
    it('should fail with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/verify-email')
        .query({ token: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/verify-email')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/password/reset', () => {
    it('should fail with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/password/reset')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/password/reset')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
