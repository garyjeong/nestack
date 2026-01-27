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

describe('FamilyController (e2e)', () => {
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

  describe('POST /api/v1/family', () => {
    it('should create a family group', async () => {
      const user = await createTestUser(app);

      const response = await authRequest(app, user.accessToken)
        .post('/api/v1/family')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('members');
      expect(response.body.data.members).toBeInstanceOf(Array);
      expect(response.body.data.members.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail if already in a family group', async () => {
      const user = await createTestUser(app);

      // Create first family
      await authRequest(app, user.accessToken)
        .post('/api/v1/family')
        .expect(201);

      // Try to create another family
      const response = await authRequest(app, user.accessToken)
        .post('/api/v1/family')
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/family')
        .expect(401);
    });
  });

  describe('GET /api/v1/family', () => {
    let familyUser: TestUser;

    beforeAll(async () => {
      familyUser = await createTestUser(app);
      await authRequest(app, familyUser.accessToken)
        .post('/api/v1/family')
        .expect(201);
    });

    it('should get family group info', async () => {
      const response = await authRequest(app, familyUser.accessToken)
        .get('/api/v1/family')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('members');
    });

    it('should fail if not in a family group', async () => {
      const userWithoutFamily = await createTestUser(app);

      const response = await authRequest(app, userWithoutFamily.accessToken)
        .get('/api/v1/family')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/family')
        .expect(401);
    });
  });

  describe('POST /api/v1/family/join', () => {
    let familyCreator: TestUser;
    let inviteCode: string;

    beforeEach(async () => {
      familyCreator = await createTestUser(app);

      // Create family
      await authRequest(app, familyCreator.accessToken)
        .post('/api/v1/family')
        .expect(201);

      // Get invite code
      const codeResponse = await authRequest(app, familyCreator.accessToken)
        .get('/api/v1/family/invite-code')
        .expect(200);

      inviteCode = codeResponse.body.data.code;
    });

    it('should join a family with valid invite code', async () => {
      const joiningUser = await createTestUser(app);

      const response = await authRequest(app, joiningUser.accessToken)
        .post('/api/v1/family/join')
        .send({ code: inviteCode })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.members.length).toBe(2);
    });

    it('should fail with invalid invite code', async () => {
      const joiningUser = await createTestUser(app);

      const response = await authRequest(app, joiningUser.accessToken)
        .post('/api/v1/family/join')
        .send({ inviteCode: 'INVALID123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail if already in a family group', async () => {
      const userInFamily = await createTestUser(app);

      // Create own family first
      await authRequest(app, userInFamily.accessToken)
        .post('/api/v1/family')
        .expect(201);

      // Try to join another family
      const response = await authRequest(app, userInFamily.accessToken)
        .post('/api/v1/family/join')
        .send({ code: inviteCode })
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/family/join')
        .send({ code: inviteCode })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/family', () => {
    it('should leave family group', async () => {
      const user = await createTestUser(app);

      // Create family
      await authRequest(app, user.accessToken)
        .post('/api/v1/family')
        .expect(201);

      // Leave family
      const response = await authRequest(app, user.accessToken)
        .delete('/api/v1/family')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Left family group successfully');
    });

    it('should fail if not in a family group', async () => {
      const userWithoutFamily = await createTestUser(app);

      const response = await authRequest(app, userWithoutFamily.accessToken)
        .delete('/api/v1/family')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/family')
        .expect(401);
    });
  });

  describe('GET /api/v1/family/invite-code', () => {
    let familyUser: TestUser;

    beforeAll(async () => {
      familyUser = await createTestUser(app);
      await authRequest(app, familyUser.accessToken)
        .post('/api/v1/family')
        .expect(201);
    });

    it('should get invite code', async () => {
      const response = await authRequest(app, familyUser.accessToken)
        .get('/api/v1/family/invite-code')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('formattedCode');
      expect(response.body.data).toHaveProperty('expiresAt');
    });

    it('should fail if not in a family group', async () => {
      const userWithoutFamily = await createTestUser(app);

      const response = await authRequest(app, userWithoutFamily.accessToken)
        .get('/api/v1/family/invite-code')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/family/invite-code', () => {
    let familyUser: TestUser;
    let originalCode: string;

    beforeAll(async () => {
      familyUser = await createTestUser(app);
      await authRequest(app, familyUser.accessToken)
        .post('/api/v1/family')
        .expect(201);

      const codeResponse = await authRequest(app, familyUser.accessToken)
        .get('/api/v1/family/invite-code')
        .expect(200);

      originalCode = codeResponse.body.data.code;
    });

    it('should regenerate invite code', async () => {
      const response = await authRequest(app, familyUser.accessToken)
        .post('/api/v1/family/invite-code')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data.code).not.toBe(originalCode);
    });

    it('should fail if not in a family group', async () => {
      const userWithoutFamily = await createTestUser(app);

      const response = await authRequest(app, userWithoutFamily.accessToken)
        .post('/api/v1/family/invite-code')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/family/share-settings', () => {
    let familyUser: TestUser;

    beforeAll(async () => {
      familyUser = await createTestUser(app);
      await authRequest(app, familyUser.accessToken)
        .post('/api/v1/family')
        .expect(201);
    });

    it('should get share settings', async () => {
      const response = await authRequest(app, familyUser.accessToken)
        .get('/api/v1/family/share-settings')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sharedAccountIds');
      expect(response.body.data).toHaveProperty('sharedMissionIds');
    });

    it('should fail if not in a family group', async () => {
      const userWithoutFamily = await createTestUser(app);

      const response = await authRequest(app, userWithoutFamily.accessToken)
        .get('/api/v1/family/share-settings')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/family/share-settings', () => {
    let familyUser: TestUser;

    beforeEach(async () => {
      familyUser = await createTestUser(app);
      await authRequest(app, familyUser.accessToken)
        .post('/api/v1/family')
        .expect(201);
    });

    it('should update share settings', async () => {
      const response = await authRequest(app, familyUser.accessToken)
        .patch('/api/v1/family/share-settings')
        .send({
          shareAllAccounts: true,
          shareAllMissions: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sharedAccountIds');
      expect(response.body.data).toHaveProperty('sharedMissionIds');
    });

    it('should fail if not in a family group', async () => {
      const userWithoutFamily = await createTestUser(app);

      const response = await authRequest(app, userWithoutFamily.accessToken)
        .patch('/api/v1/family/share-settings')
        .send({ shareAllAccounts: true })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
