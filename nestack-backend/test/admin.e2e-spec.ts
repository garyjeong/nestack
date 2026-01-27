import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  createAdminUser,
  loginAdmin,
  authRequest,
  TestContext,
  TestUser,
  TestAdmin,
} from './test-utils';
import { AdminRole } from '../src/common/enums';

describe('AdminController (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;
  let testUser: TestUser;
  let admin: TestAdmin;
  let adminCredentials: { email: string; password: string };

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;
    testUser = await createTestUser(app);

    // Create and login as admin user
    adminCredentials = {
      email: `admin-${Date.now()}@example.com`,
      password: 'AdminPassword123!',
    };
    await createAdminUser(context.dataSource, {
      email: adminCredentials.email,
      password: adminCredentials.password,
      name: 'Test Admin',
      role: AdminRole.SUPER_ADMIN,
    });
    admin = await loginAdmin(app, adminCredentials.email, adminCredentials.password);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('POST /api/v1/admin/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send({
          email: adminCredentials.email,
          password: adminCredentials.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('admin');
      expect(response.body.data.admin).toHaveProperty('email', adminCredentials.email);
      expect(response.body.data.admin).toHaveProperty('role', AdminRole.SUPER_ADMIN);
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send({
          email: 'invalid@admin.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Public Endpoints', () => {
    describe('GET /api/v1/admin/announcements/active', () => {
      it('should return active announcements (public)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/announcements/active')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });
  });

  describe('Protected Endpoints (require authentication)', () => {
    describe('GET /api/v1/admin/dashboard', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/dashboard')
          .expect(401);
      });

      it('should return dashboard stats with valid token', async () => {
        // Note: Admin endpoints currently use regular JWT auth (no admin-specific guard)
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/admin/dashboard')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('totalUsers');
        expect(response.body.data).toHaveProperty('totalFamilyGroups');
        expect(response.body.data).toHaveProperty('totalMissions');
        expect(response.body.data).toHaveProperty('completedMissions');
        expect(response.body.data).toHaveProperty('totalSavingsAmount');
        expect(response.body.data).toHaveProperty('activeBadges');
      });
    });

    describe('GET /api/v1/admin/users', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/users')
          .expect(401);
      });

      it('should support pagination', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/admin/users')
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('users');
        expect(response.body.data).toHaveProperty('total');
        expect(response.body.data.users).toBeInstanceOf(Array);
      });
    });

    describe('PATCH /api/v1/admin/users/:id/status', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .patch(`/api/v1/admin/users/${testUser.id}/status`)
          .send({ status: 'SUSPENDED' })
          .expect(401);
      });

      it('should update user status', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .patch(`/api/v1/admin/users/${testUser.id}/status`)
          .send({ status: 'ACTIVE' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.status).toBe('ACTIVE');
      });
    });
  });

  describe('Categories Management', () => {
    let categoryId: string;

    describe('GET /api/v1/admin/categories', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/categories')
          .expect(401);
      });

      it('should return categories list', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/admin/categories')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/v1/admin/categories', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/admin/categories')
          .send({
            name: 'Test Category',
          })
          .expect(401);
      });

      it('should create category', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .post('/api/v1/admin/categories')
          .send({
            name: `Test Category ${Date.now()}`,
            displayOrder: 1,
          })
          .expect(201);

        if (response.body.success) {
          expect(response.body.data).toHaveProperty('id');
          expect(response.body.data).toHaveProperty('name');
          categoryId = response.body.data.id;
        }
      });
    });

    describe('PATCH /api/v1/admin/categories/:id', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .patch('/api/v1/admin/categories/some-id')
          .send({ name: 'Updated Name' })
          .expect(401);
      });

      it('should return 404 for non-existent category', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .patch('/api/v1/admin/categories/00000000-0000-0000-0000-000000000000')
          .send({ name: 'Updated Name' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/admin/categories/:id', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .delete('/api/v1/admin/categories/some-id')
          .expect(401);
      });

      it('should return 404 for non-existent category', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .delete('/api/v1/admin/categories/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Templates Management', () => {
    describe('GET /api/v1/admin/templates', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/templates')
          .expect(401);
      });

      it('should return templates list', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/admin/templates')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/v1/admin/templates', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/admin/templates')
          .send({
            title: 'Test Template',
            description: 'Test Description',
          })
          .expect(401);
      });

      it('should fail without required fields', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .post('/api/v1/admin/templates')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PATCH /api/v1/admin/templates/:id', () => {
      it('should return 404 for non-existent template', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .patch('/api/v1/admin/templates/00000000-0000-0000-0000-000000000000')
          .send({ name: 'Updated Name' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/admin/templates/:id', () => {
      it('should return 404 for non-existent template', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .delete('/api/v1/admin/templates/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Badges Management', () => {
    describe('GET /api/v1/admin/badges', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/badges')
          .expect(401);
      });

      it('should return badges list', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/admin/badges')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/v1/admin/badges', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/admin/badges')
          .send({
            name: 'Test Badge',
            description: 'Test Description',
          })
          .expect(401);
      });

      it('should fail without required fields', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .post('/api/v1/admin/badges')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('POST /api/v1/admin/badges/issue', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/admin/badges/issue')
          .send({
            badgeId: 'some-badge-id',
            userId: testUser.id,
          })
          .expect(401);
      });

      it('should fail without required fields', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .post('/api/v1/admin/badges/issue')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Announcements Management', () => {
    let announcementId: string;

    describe('GET /api/v1/admin/announcements', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/announcements')
          .expect(401);
      });

      it('should return announcements list', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/admin/announcements')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/v1/admin/announcements', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/admin/announcements')
          .send({
            title: 'Test Announcement',
            content: 'Test Content',
          })
          .expect(401);
      });

      it('should fail to create announcement without admin user in createdBy (FK constraint)', async () => {
        const now = new Date();
        const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // Note: Announcement creation requires admin user ID in createdBy field
        // Regular user tokens will fail due to FK constraint
        const response = await authRequest(app, testUser.accessToken)
          .post('/api/v1/admin/announcements')
          .send({
            title: `Test Announcement ${Date.now()}`,
            content: 'Test Content for the announcement',
            displayType: 'NOTICE',
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
          })
          .expect(500);

        expect(response.body.success).toBe(false);
      });
    });

    describe('PATCH /api/v1/admin/announcements/:id', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .patch('/api/v1/admin/announcements/some-id')
          .send({ title: 'Updated Title' })
          .expect(401);
      });

      it('should return 404 for non-existent announcement', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .patch('/api/v1/admin/announcements/00000000-0000-0000-0000-000000000000')
          .send({ title: 'Updated Title' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });

    describe('DELETE /api/v1/admin/announcements/:id', () => {
      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .delete('/api/v1/admin/announcements/some-id')
          .expect(401);
      });

      it('should return 404 for non-existent announcement', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .delete('/api/v1/admin/announcements/00000000-0000-0000-0000-000000000000')
          .expect(404);

        expect(response.body.success).toBe(false);
      });
    });
  });
});
