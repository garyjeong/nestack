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
  createCategory,
  createTemplate,
  createBadge,
  SeedCategory,
  SeedTemplate,
  SeedBadge,
} from './test-utils';
import {
  BadgeType,
  BadgeConditionType,
  AdminRole,
  GoalType,
} from '../src/common/enums';

/**
 * Integration Tests - B2C User Flow
 *
 * Tests the complete user journey:
 * 1. User signup and authentication
 * 2. Family group creation and invite
 * 3. Mission creation with real category
 * 4. Mission management (status updates)
 * 5. Badge earning based on actions
 */
describe('Integration Tests - B2C User Flow', () => {
  let context: TestContext;
  let app: INestApplication;
  let seedCategory: SeedCategory;
  let seedTemplate: SeedTemplate;
  let seedBadge: SeedBadge;

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;

    // Seed required data
    seedCategory = await createCategory(context.dataSource, {
      name: '주거 테스트',
      displayOrder: 1,
    });

    seedTemplate = await createTemplate(context.dataSource, seedCategory.id, {
      name: '전세 자금 모으기',
      description: '전세를 위한 목돈 마련',
      defaultGoalAmount: 50000000,
    });

    seedBadge = await createBadge(context.dataSource, {
      name: '첫 미션 시작',
      description: '첫 미션을 생성했습니다',
      badgeType: BadgeType.LIFECYCLE,
      conditionType: BadgeConditionType.FIRST_ACTION,
      conditionValue: { actionType: 'mission' },
    });
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('Complete User Journey', () => {
    let primaryUser: TestUser;
    let secondaryUser: TestUser;
    let missionId: string;
    let familyInviteCode: string;

    it('Step 1: Primary user signs up', async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email: `primary-${Date.now()}@example.com`,
          password: 'StrongPassword123!',
          name: '김철수',
        })
        .expect(201);

      expect(signupResponse.body.success).toBe(true);
      expect(signupResponse.body.data).toHaveProperty('userId');
      expect(signupResponse.body.data).toHaveProperty('tokens');
      expect(signupResponse.body.data.tokens).toHaveProperty('accessToken');

      primaryUser = {
        id: signupResponse.body.data.userId,
        email: signupResponse.body.data.email,
        name: signupResponse.body.data.name,
        accessToken: signupResponse.body.data.tokens.accessToken,
        refreshToken: signupResponse.body.data.tokens.refreshToken,
      };
    });

    it('Step 2: Primary user creates family group', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .post('/api/v1/family')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.members).toBeInstanceOf(Array);
      expect(response.body.data.members.length).toBe(1);
      expect(response.body.data.members[0].id).toBe(primaryUser.id);
    });

    it('Step 3: Primary user gets invite code', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/family/invite-code')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('code');
      expect(response.body.data).toHaveProperty('expiresAt');

      familyInviteCode = response.body.data.code;
    });

    it('Step 4: Secondary user signs up and joins family', async () => {
      secondaryUser = await createTestUser(app, {
        email: `secondary-${Date.now()}@example.com`,
        name: '김영희',
      });

      const joinResponse = await authRequest(app, secondaryUser.accessToken)
        .post('/api/v1/family/join')
        .send({ code: familyInviteCode })
        .expect(200);

      expect(joinResponse.body.success).toBe(true);
      expect(joinResponse.body.data.members.length).toBe(2);
    });

    it('Step 5: Verify family has both members', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/family')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.members.length).toBe(2);

      const memberIds = response.body.data.members.map((m: any) => m.id);
      expect(memberIds).toContain(primaryUser.id);
      expect(memberIds).toContain(secondaryUser.id);
    });

    it('Step 6: Primary user views available categories', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/missions/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const category = response.body.data.find(
        (c: any) => c.id === seedCategory.id,
      );
      expect(category).toBeDefined();
      expect(category.name).toBe(seedCategory.name);
    });

    it('Step 7: Primary user views available templates', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/missions/templates')
        .query({ categoryId: seedCategory.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const template = response.body.data.find(
        (t: any) => t.id === seedTemplate.id,
      );
      expect(template).toBeDefined();
      expect(template.name).toBe(seedTemplate.name);
    });

    it('Step 8: Primary user creates a mission', async () => {
      const missionData = {
        name: '전세 자금 모으기',
        description: '3년 안에 전세 자금 모으기',
        categoryId: seedCategory.id,
        goalAmount: 30000000,
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const response = await authRequest(app, primaryUser.accessToken)
        .post('/api/v1/missions')
        .send(missionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(missionData.name);
      expect(response.body.data.status).toBe('PENDING');

      missionId = response.body.data.id;
    });

    it('Step 9: Primary user views their missions', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/missions')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);

      const mission = response.body.data.find((m: any) => m.id === missionId);
      expect(mission).toBeDefined();
    });

    it('Step 10: Primary user updates mission status to IN_PROGRESS', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .patch(`/api/v1/missions/${missionId}/status`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });

    it('Step 11: Primary user views mission summary', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/missions/summary')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalMissions');
      expect(response.body.data).toHaveProperty('activeMissions');
      expect(response.body.data.totalMissions).toBeGreaterThanOrEqual(1);
      expect(response.body.data.activeMissions).toBeGreaterThanOrEqual(1);
    });

    it('Step 12: Primary user updates mission details', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .patch(`/api/v1/missions/${missionId}`)
        .send({
          description: '업데이트된 설명: 열심히 모으자!',
          goalAmount: 35000000,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('업데이트된 설명: 열심히 모으자!');
      expect(response.body.data.goalAmount).toBe(35000000);
    });

    it('Step 13: Primary user views mission details', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get(`/api/v1/missions/${missionId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(missionId);
      expect(response.body.data.status).toBe('IN_PROGRESS');
    });

    it('Step 14: Primary user views available badges', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/badges')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('Step 15: Primary user completes mission', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .patch(`/api/v1/missions/${missionId}/status`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
    });

    it('Step 16: Secondary user leaves family', async () => {
      const response = await authRequest(app, secondaryUser.accessToken)
        .delete('/api/v1/family')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('Step 17: Verify family now has one member', async () => {
      const response = await authRequest(app, primaryUser.accessToken)
        .get('/api/v1/family')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.members.length).toBe(1);
    });
  });

  describe('Token Refresh Flow', () => {
    it('should refresh token successfully', async () => {
      const user = await createTestUser(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: user.refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');

      // New access token should work
      const profileResponse = await authRequest(
        app,
        response.body.data.accessToken,
      )
        .get('/api/v1/users/me')
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
    });
  });

  describe('User Profile Management', () => {
    let testUserProfile: TestUser;

    beforeAll(async () => {
      testUserProfile = await createTestUser(app);
    });

    it('should get user profile', async () => {
      const response = await authRequest(app, testUserProfile.accessToken)
        .get('/api/v1/users/me')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testUserProfile.id);
      expect(response.body.data).toHaveProperty('email', testUserProfile.email);
      expect(response.body.data).toHaveProperty('name', testUserProfile.name);
    });

    it('should update user profile', async () => {
      const response = await authRequest(app, testUserProfile.accessToken)
        .patch('/api/v1/users/me')
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });
  });
});

/**
 * Integration Tests - Admin Flow
 *
 * Tests the complete admin journey:
 * 1. Admin login
 * 2. Dashboard statistics
 * 3. User management
 * 4. Category CRUD
 * 5. Template CRUD
 * 6. Badge CRUD and issuance
 * 7. Announcement CRUD
 *
 * Note: Admin protected endpoints currently use regular JWT auth,
 * so we use regular user tokens for most tests.
 */
describe('Integration Tests - Admin Flow', () => {
  let context: TestContext;
  let app: INestApplication;
  let admin: TestAdmin;
  let testUser: TestUser;
  let adminUserData: { id: string; email: string; password: string };

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;

    // Create admin user in database for admin login tests
    adminUserData = await createAdminUser(context.dataSource, {
      email: `superadmin-${Date.now()}@example.com`,
      password: 'AdminPassword123!',
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
    });

    // Login as admin (for admin-specific tests)
    admin = await loginAdmin(app, adminUserData.email, adminUserData.password);

    // Create a test user for admin protected endpoints
    testUser = await createTestUser(app);
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('Admin Authentication', () => {
    it('should login successfully with valid credentials', async () => {
      expect(testUser.accessToken).toBeDefined();
      expect(admin.role).toBe(AdminRole.SUPER_ADMIN);
    });

    it('should fail with invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send({
          email: 'wrong@admin.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Dashboard', () => {
    it('should get dashboard statistics', async () => {
      // Note: Admin endpoints use regular JWT auth
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/admin/dashboard')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('newUsersToday');
      expect(response.body.data).toHaveProperty('totalFamilyGroups');
      expect(response.body.data).toHaveProperty('totalMissions');
      expect(response.body.data).toHaveProperty('completedMissions');
      expect(response.body.data).toHaveProperty('totalSavingsAmount');
      expect(response.body.data).toHaveProperty('activeBadges');

      // Values should be numbers
      expect(typeof response.body.data.totalUsers).toBe('number');
      expect(typeof response.body.data.totalSavingsAmount).toBe('number');
    });
  });

  describe('User Management', () => {
    it('should get list of users with pagination', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/admin/users')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.total).toBeGreaterThanOrEqual(1);
    });

    it('should update user status', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/users/${testUser.id}/status`)
        .send({ status: 'INACTIVE' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('INACTIVE');

      // Restore status
      await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/users/${testUser.id}/status`)
        .send({ status: 'ACTIVE' })
        .expect(200);
    });
  });

  describe('Category CRUD', () => {
    let categoryId: string;

    it('should create a category', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/admin/categories')
        .send({
          name: `Admin Test Category ${Date.now()}`,
          displayOrder: 10,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');

      categoryId = response.body.data.id;
    });

    it('should get list of categories', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/admin/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const category = response.body.data.find((c: any) => c.id === categoryId);
      expect(category).toBeDefined();
    });

    it('should update a category', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/categories/${categoryId}`)
        .send({
          name: 'Updated Category Name',
          displayOrder: 20,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Category Name');
      expect(response.body.data.displayOrder).toBe(20);
    });

    it('should delete a category', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .delete(`/api/v1/admin/categories/${categoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/categories/${categoryId}`)
        .send({ name: 'Should Fail' })
        .expect(404);
    });
  });

  describe('Template CRUD', () => {
    let templateId: string;
    let templateCategoryId: string;

    beforeAll(async () => {
      // Create a category for templates
      const category = await createCategory(context.dataSource, {
        name: `Template Test Category ${Date.now()}`,
      });
      templateCategoryId = category.id;
    });

    it('should create a template', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/admin/templates')
        .send({
          name: `Admin Test Template ${Date.now()}`,
          description: 'Test template description',
          categoryId: templateCategoryId,
          goalType: GoalType.AMOUNT,
          defaultGoalAmount: 5000000,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');

      templateId = response.body.data.id;
    });

    it('should get list of templates', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/admin/templates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const template = response.body.data.find((t: any) => t.id === templateId);
      expect(template).toBeDefined();
    });

    it('should update a template', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/templates/${templateId}`)
        .send({
          name: 'Updated Template Name',
          defaultGoalAmount: 10000000,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Template Name');
      expect(response.body.data.defaultGoalAmount).toBe(10000000);
    });

    it('should delete a template', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .delete(`/api/v1/admin/templates/${templateId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/templates/${templateId}`)
        .send({ name: 'Should Fail' })
        .expect(404);
    });
  });

  describe('Badge CRUD and Issuance', () => {
    let badgeId: string;

    it('should create a badge', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/admin/badges')
        .send({
          name: `Admin Test Badge ${Date.now()}`,
          description: 'Test badge description',
          badgeType: BadgeType.ACHIEVEMENT,
          conditionType: BadgeConditionType.MISSION_COMPLETE,
          conditionValue: { count: 5 },
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name');

      badgeId = response.body.data.id;
    });

    it('should get list of badges', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/admin/badges')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const badge = response.body.data.find((b: any) => b.id === badgeId);
      expect(badge).toBeDefined();
    });

    it('should update a badge', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/badges/${badgeId}`)
        .send({
          name: 'Updated Badge Name',
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Badge Name');
    });

    it('should issue a badge to a user', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/admin/badges/issue')
        .send({
          badgeId: badgeId,
          userId: testUser.id,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId', testUser.id);
      expect(response.body.data).toHaveProperty('badgeId', badgeId);
      expect(response.body.data).toHaveProperty('issueType', 'MANUAL');
    });

    it('should verify user received the badge', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/badges/me')
        .expect(200);

      expect(response.body.success).toBe(true);

      const issuedBadge = response.body.data.find(
        (ub: any) => ub.badge.id === badgeId,
      );
      expect(issuedBadge).toBeDefined();
      expect(issuedBadge.issueType).toBe('MANUAL');
    });

    it('should delete a badge', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .delete(`/api/v1/admin/badges/${badgeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Announcement CRUD', () => {
    let announcementId: string;

    it('should create an announcement via direct DB insert (FK constraint requires admin ID)', async () => {
      // Note: Announcement creation via API requires admin user ID in createdBy
      // Since we can't use admin token with current JWT setup, we insert directly
      const now = new Date();
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const result = await context.dataSource.query(
        `INSERT INTO announcements (title, content, display_type, start_date, end_date, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [
          `Test Announcement ${Date.now()}`,
          'Test announcement content',
          'NOTICE',
          now,
          endDate,
          'ACTIVE',
          adminUserData.id,
        ],
      );

      announcementId = result[0].id;
      expect(announcementId).toBeDefined();
    });

    it('should get list of announcements', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/admin/announcements')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      const announcement = response.body.data.find(
        (a: any) => a.id === announcementId,
      );
      expect(announcement).toBeDefined();
    });

    it('should get active announcements (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/announcements/active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should update an announcement', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/announcements/${announcementId}`)
        .send({
          title: 'Updated Announcement Title',
          content: 'Updated content',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Announcement Title');
    });

    it('should delete an announcement', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .delete(`/api/v1/admin/announcements/${announcementId}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      await authRequest(app, testUser.accessToken)
        .patch(`/api/v1/admin/announcements/${announcementId}`)
        .send({ title: 'Should Fail' })
        .expect(404);
    });
  });
});

/**
 * Integration Tests - Error Handling and Edge Cases
 */
describe('Integration Tests - Error Handling', () => {
  let context: TestContext;
  let app: INestApplication;

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('Authentication Errors', () => {
    it('should reject expired/invalid tokens', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/me')
        .expect(401);
    });

    it('should reject duplicate email on signup', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // First signup
      await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({ email, password: 'Password123!', name: 'Test' })
        .expect(201);

      // Duplicate signup
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({ email, password: 'Password123!', name: 'Test' })
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should reject login with wrong password', async () => {
      const testUser = await createTestUser(app);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword123!' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Resource Not Found Errors', () => {
    let testUser: TestUser;

    beforeAll(async () => {
      testUser = await createTestUser(app);
    });

    it('should return 404 for non-existent mission', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/missions/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent badge', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/badges/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for family when user is not in one', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/family')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Validation Errors', () => {
    let testUser: TestUser;

    beforeAll(async () => {
      testUser = await createTestUser(app);
    });

    it('should reject signup with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({ email: 'invalid-email', password: 'Password123!', name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject signup with weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({ email: 'test@test.com', password: '123', name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject mission creation without required fields', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .post('/api/v1/missions')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
