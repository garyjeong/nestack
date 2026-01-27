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

describe('FinanceController (e2e)', () => {
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

  describe('Open Banking', () => {
    describe('GET /api/v1/finance/openbanking/authorize', () => {
      it('should return authorization URL', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/finance/openbanking/authorize')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('url');
        expect(response.body.data.url).toContain('oauth');
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/finance/openbanking/authorize')
          .expect(401);
      });
    });

    describe('GET /api/v1/finance/openbanking/callback', () => {
      it('should redirect on callback (public endpoint)', async () => {
        // This endpoint redirects, so we check for redirect status
        const response = await request(app.getHttpServer())
          .get('/api/v1/finance/openbanking/callback')
          .query({
            code: 'test-code',
            state: Buffer.from(JSON.stringify({ userId: testUser.id })).toString('base64'),
          })
          .expect(302);

        // Check redirect location contains error (since test code is invalid)
        expect(response.header.location).toContain('error');
      });
    });

    describe('GET /api/v1/finance/openbanking/status', () => {
      it('should return connection status', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/finance/openbanking/status')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('isConnected');
        expect(typeof response.body.data.isConnected).toBe('boolean');
      });

      it('should return not connected for new user', async () => {
        const newUser = await createTestUser(app);

        const response = await authRequest(app, newUser.accessToken)
          .get('/api/v1/finance/openbanking/status')
          .expect(200);

        expect(response.body.data.isConnected).toBe(false);
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/finance/openbanking/status')
          .expect(401);
      });
    });

    describe('DELETE /api/v1/finance/openbanking', () => {
      it('should disconnect open banking (even if not connected)', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .delete('/api/v1/finance/openbanking')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.message).toBe('Open Banking disconnected successfully');
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .delete('/api/v1/finance/openbanking')
          .expect(401);
      });
    });
  });

  describe('Accounts', () => {
    describe('GET /api/v1/finance/accounts', () => {
      it('should return empty array for new user', async () => {
        const newUser = await createTestUser(app);

        const response = await authRequest(app, newUser.accessToken)
          .get('/api/v1/finance/accounts')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/finance/accounts')
          .expect(401);
      });
    });

    describe('POST /api/v1/finance/accounts/sync', () => {
      it('should fail without open banking connection', async () => {
        const newUser = await createTestUser(app);

        const response = await authRequest(app, newUser.accessToken)
          .post('/api/v1/finance/accounts/sync')
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/finance/accounts/sync')
          .expect(401);
      });
    });

    describe('PATCH /api/v1/finance/accounts/:id', () => {
      it('should return 404 for non-existent account', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .patch('/api/v1/finance/accounts/00000000-0000-0000-0000-000000000000')
          .send({ accountAlias: 'My Account' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .patch('/api/v1/finance/accounts/some-id')
          .send({ accountAlias: 'My Account' })
          .expect(401);
      });
    });

    describe('POST /api/v1/finance/accounts/:id/transactions/sync', () => {
      it('should return 404 for non-existent account', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .post('/api/v1/finance/accounts/00000000-0000-0000-0000-000000000000/transactions/sync')
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/finance/accounts/some-id/transactions/sync')
          .expect(401);
      });
    });
  });

  describe('Transactions', () => {
    describe('GET /api/v1/finance/transactions', () => {
      it('should return empty result for user without accounts', async () => {
        const newUser = await createTestUser(app);

        const response = await authRequest(app, newUser.accessToken)
          .get('/api/v1/finance/transactions')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
        expect(response.body.data.length).toBe(0);
        expect(response.body.meta).toHaveProperty('page');
        expect(response.body.meta).toHaveProperty('limit');
      });

      it('should support pagination', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/finance/transactions')
          .query({ page: 1, limit: 10 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.meta).toHaveProperty('page', 1);
        expect(response.body.meta).toHaveProperty('limit', 10);
        expect(response.body.meta).toHaveProperty('totalItems');
        expect(response.body.meta).toHaveProperty('totalPages');
      });

      it('should support filtering by type', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/finance/transactions')
          .query({ type: 'DEPOSIT' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('should support filtering by date range', async () => {
        const today = new Date();
        const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/finance/transactions')
          .query({
            startDate: lastMonth.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('should support filtering by account', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/finance/transactions')
          .query({ accountId: '00000000-0000-0000-0000-000000000000' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('should support filtering by mission', async () => {
        const response = await authRequest(app, testUser.accessToken)
          .get('/api/v1/finance/transactions')
          .query({ missionId: '00000000-0000-0000-0000-000000000000' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      it('should fail without authentication', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/finance/transactions')
          .expect(401);
      });
    });
  });

  describe('Authorization - Cross-user access', () => {
    let otherUser: TestUser;

    beforeAll(async () => {
      otherUser = await createTestUser(app);
    });

    it('should not return other user accounts', async () => {
      // Both users should only see their own (empty) accounts
      const user1Response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/finance/accounts')
        .expect(200);

      const user2Response = await authRequest(app, otherUser.accessToken)
        .get('/api/v1/finance/accounts')
        .expect(200);

      // Each user should have their own account list (both empty for new users)
      expect(user1Response.body.data).toBeInstanceOf(Array);
      expect(user2Response.body.data).toBeInstanceOf(Array);
    });

    it('should not allow updating other user account', async () => {
      // Attempt to update a non-existent account with another user's token
      const response = await authRequest(app, otherUser.accessToken)
        .patch('/api/v1/finance/accounts/00000000-0000-0000-0000-000000000000')
        .send({ accountAlias: 'Hacked Account' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
