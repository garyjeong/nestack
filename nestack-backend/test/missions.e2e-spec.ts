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

describe('MissionsController (e2e)', () => {
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

  describe('GET /api/v1/missions/categories', () => {
    it('should get all lifecycle categories', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/missions/categories')
        .expect(401);
    });
  });

  describe('GET /api/v1/missions/templates', () => {
    it('should get all mission templates', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should filter templates by category', async () => {
      // Use valid UUID format even if category doesn't exist
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions/templates')
        .query({ categoryId: '00000000-0000-0000-0000-000000000000' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/missions/templates')
        .expect(401);
    });
  });

  describe('POST /api/v1/missions', () => {
    // Note: Creating missions requires a valid categoryId, which needs to be created first
    // These tests will pass validation but may fail if no categories exist

    it('should fail without required fields', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/missions')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/missions')
        .send({ name: 'Test Mission' })
        .expect(401);
    });

    it('should fail with invalid categoryId', async () => {
      const missionData = {
        name: 'Save for vacation',
        description: 'Save money for summer vacation',
        categoryId: '00000000-0000-0000-0000-000000000000',
        goalAmount: 1000000,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/missions')
        .send(missionData);

      // May return 404 (category not found), 400 (validation), or 500 (FK constraint)
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/v1/missions', () => {
    it('should get all user missions', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
    });

    it('should paginate missions', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('limit', 10);
      expect(response.body.meta).toHaveProperty('totalItems');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('should filter by status', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions')
        .query({ status: 'PENDING' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/missions')
        .expect(401);
    });
  });

  describe('GET /api/v1/missions/summary', () => {
    it('should get mission summary statistics', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalMissions');
      expect(response.body.data).toHaveProperty('completedMissions');
      expect(response.body.data).toHaveProperty('activeMissions');
      expect(response.body.data).toHaveProperty('totalSavedAmount');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/missions/summary')
        .expect(401);
    });
  });

  describe('GET /api/v1/missions/:id', () => {
    it('should return 404 for non-existent mission', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/missions/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });
  });

  describe('PATCH /api/v1/missions/:id', () => {
    it('should return 404 for non-existent mission', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch('/api/v1/missions/00000000-0000-0000-0000-000000000000')
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/missions/00000000-0000-0000-0000-000000000000')
        .send({ name: 'New Name' })
        .expect(401);
    });
  });

  describe('PATCH /api/v1/missions/:id/status', () => {
    it('should fail with invalid status', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch('/api/v1/missions/00000000-0000-0000-0000-000000000000/status')
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent mission', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch('/api/v1/missions/00000000-0000-0000-0000-000000000000/status')
        .send({ status: 'IN_PROGRESS' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/missions/:id', () => {
    it('should return 404 for non-existent mission', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .delete('/api/v1/missions/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/missions/00000000-0000-0000-0000-000000000000')
        .expect(401);
    });
  });

  describe('POST /api/v1/missions/:id/transactions', () => {
    it('should fail with empty transactionIds', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/missions/00000000-0000-0000-0000-000000000000/transactions')
        .send({ transactionIds: [] })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent mission', async () => {
      // Use valid UUID v4 format for transactionIds
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/missions/00000000-0000-4000-8000-000000000000/transactions')
        .send({ transactionIds: ['00000000-0000-4000-8000-000000000001'] })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/missions/00000000-0000-4000-8000-000000000000/transactions')
        .send({ transactionIds: ['00000000-0000-4000-8000-000000000001'] })
        .expect(401);
    });
  });

  // Note: Full CRUD tests with actual mission creation require valid categoryId
  // which needs seed data in the test database. The tests above cover authentication,
  // validation, and 404 scenarios which work without seed data.
});
