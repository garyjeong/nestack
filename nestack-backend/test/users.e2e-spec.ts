import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  authRequest,
  TestContext,
  TestUser,
} from './test-utils';

describe('UsersController (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;
  let testUser: TestUser;

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;
    testUser = await createTestUser(app);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('GET /api/v1/users/me', () => {
    it('should return current user profile', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/users/me')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testUser.id);
      expect(response.body.data).toHaveProperty('email', testUser.email);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('provider');
      expect(response.body.data).toHaveProperty('emailVerified');
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user name', async () => {
      const newName = 'Updated Name';

      const response = await authRequest(app, testUser.accessToken)
        .patch('/api/v1/users/me')
        .send({ name: newName })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(newName);
    });

    it('should update user profile image URL', async () => {
      const profileImageUrl = 'https://example.com/avatar.jpg';

      const response = await authRequest(app, testUser.accessToken)
        .patch('/api/v1/users/me')
        .send({ profileImageUrl })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.profileImageUrl).toBe(profileImageUrl);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should ignore unknown fields', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch('/api/v1/users/me')
        .send({ unknownField: 'value' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/users/me/password', () => {
    let passwordTestUser: TestUser;
    const originalPassword = 'OriginalPass123!';
    const newPassword = 'NewPassword456!';

    beforeEach(async () => {
      passwordTestUser = await createTestUser(app, {
        password: originalPassword,
      });
    });

    it('should change password successfully', async () => {
      const response = await authRequest(app, passwordTestUser.accessToken)
        .patch('/api/v1/users/me/password')
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Password changed successfully');

      // Verify new password works
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: passwordTestUser.email,
          password: newPassword,
        })
        .expect(200);
    });

    it('should fail with incorrect current password', async () => {
      const response = await authRequest(app, passwordTestUser.accessToken)
        .patch('/api/v1/users/me/password')
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: newPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with weak new password', async () => {
      const response = await authRequest(app, passwordTestUser.accessToken)
        .patch('/api/v1/users/me/password')
        .send({
          currentPassword: originalPassword,
          newPassword: '123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const response = await authRequest(app, passwordTestUser.accessToken)
        .patch('/api/v1/users/me/password')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/users/me/password')
        .send({
          currentPassword: originalPassword,
          newPassword: newPassword,
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/users/me', () => {
    it('should delete user account', async () => {
      const userToDelete = await createTestUser(app);

      const response = await authRequest(app, userToDelete.accessToken)
        .delete('/api/v1/users/me')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Account deleted successfully');

      // Verify user can no longer login
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userToDelete.email,
          password: 'TestPassword123!',
        })
        .expect(401);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .expect(401);
    });
  });
});
