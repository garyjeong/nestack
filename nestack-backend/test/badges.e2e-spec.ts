import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  authRequest,
  TestContext,
  TestUser,
  createBadge,
  issueBadgeToUser,
  SeedBadge,
} from './test-utils';
import { BadgeType, BadgeConditionType } from '../src/common/enums';

describe('BadgesController (e2e)', () => {
  let context: TestContext;
  let app: INestApplication;
  let testUser: TestUser;
  let testBadges: SeedBadge[];

  beforeAll(async () => {
    context = await createTestApp();
    app = context.app;
    testUser = await createTestUser(app);

    // Create test badges
    testBadges = [];
    testBadges.push(
      await createBadge(context.dataSource, {
        name: 'First Mission Badge',
        description: 'Complete your first mission',
        badgeType: BadgeType.ACHIEVEMENT,
        conditionType: BadgeConditionType.MISSION_COMPLETE,
        conditionValue: { count: 1 },
      }),
    );
    testBadges.push(
      await createBadge(context.dataSource, {
        name: 'Savings Master',
        description: 'Save 1 million won',
        badgeType: BadgeType.ACHIEVEMENT,
        conditionType: BadgeConditionType.SAVINGS_AMOUNT,
        conditionValue: { amount: 1000000 },
      }),
    );
    testBadges.push(
      await createBadge(context.dataSource, {
        name: 'Family Starter',
        description: 'Join a family group',
        badgeType: BadgeType.SPECIAL,
        conditionType: BadgeConditionType.FIRST_ACTION,
        conditionValue: { actionType: 'family' },
      }),
    );
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe('GET /api/v1/badges', () => {
    it('should get all badges with user progress', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/badges')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(testBadges.length);

      // Each badge should have required properties
      if (response.body.data.length > 0) {
        const badge = response.body.data[0];
        expect(badge).toHaveProperty('id');
        expect(badge).toHaveProperty('name');
        expect(badge).toHaveProperty('badgeType');
        expect(badge).toHaveProperty('conditionType');
        expect(badge).toHaveProperty('earned');
      }
    });

    it('should show earned status as false for unearned badges', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/badges')
        .expect(200);

      expect(response.body.success).toBe(true);

      // New user shouldn't have earned any badges yet
      const unearnedBadges = response.body.data.filter(
        (b: any) => !b.earned,
      );
      expect(unearnedBadges.length).toBeGreaterThan(0);
    });

    it('should show earned status as true for earned badges', async () => {
      // Create a new user and issue a badge
      const userWithBadge = await createTestUser(app);
      await issueBadgeToUser(
        context.dataSource,
        userWithBadge.id,
        testBadges[0].id,
      );

      const response = await authRequest(app, userWithBadge.accessToken)
        .get('/api/v1/badges')
        .expect(200);

      expect(response.body.success).toBe(true);

      const earnedBadge = response.body.data.find(
        (b: any) => b.id === testBadges[0].id,
      );
      expect(earnedBadge).toBeDefined();
      expect(earnedBadge.earned).toBe(true);
      expect(earnedBadge.earnedAt).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/badges')
        .expect(401);
    });
  });

  describe('GET /api/v1/badges/me', () => {
    it('should return empty array for new user', async () => {
      const newUser = await createTestUser(app);

      const response = await authRequest(app, newUser.accessToken)
        .get('/api/v1/badges/me')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });

    it('should return earned badges for user', async () => {
      // Create user and issue multiple badges
      const userWithBadges = await createTestUser(app);
      await issueBadgeToUser(
        context.dataSource,
        userWithBadges.id,
        testBadges[0].id,
      );
      await issueBadgeToUser(
        context.dataSource,
        userWithBadges.id,
        testBadges[1].id,
      );

      const response = await authRequest(app, userWithBadges.accessToken)
        .get('/api/v1/badges/me')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);

      // Check badge structure
      response.body.data.forEach((userBadge: any) => {
        expect(userBadge).toHaveProperty('id');
        expect(userBadge).toHaveProperty('badge');
        expect(userBadge).toHaveProperty('issueType');
        expect(userBadge).toHaveProperty('issuedAt');
        expect(userBadge.badge).toHaveProperty('name');
        expect(userBadge.badge).toHaveProperty('badgeType');
      });
    });

    it('should return badges in descending order by issuedAt', async () => {
      const userWithBadges = await createTestUser(app);

      // Issue badges with slight delay
      await issueBadgeToUser(
        context.dataSource,
        userWithBadges.id,
        testBadges[0].id,
      );

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      await issueBadgeToUser(
        context.dataSource,
        userWithBadges.id,
        testBadges[1].id,
      );

      const response = await authRequest(app, userWithBadges.accessToken)
        .get('/api/v1/badges/me')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2);

      // Second issued badge should come first (descending order)
      const dates = response.body.data.map((b: any) => new Date(b.issuedAt).getTime());
      expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/badges/me')
        .expect(401);
    });
  });

  describe('GET /api/v1/badges/:id', () => {
    it('should get badge details', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get(`/api/v1/badges/${testBadges[0].id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', testBadges[0].id);
      expect(response.body.data).toHaveProperty('name', testBadges[0].name);
      expect(response.body.data).toHaveProperty('badgeType');
      expect(response.body.data).toHaveProperty('conditionType');
      expect(response.body.data).toHaveProperty('conditionValue');
      expect(response.body.data).toHaveProperty('earned');
    });

    it('should show earned status correctly', async () => {
      // User with badge
      const userWithBadge = await createTestUser(app);
      await issueBadgeToUser(
        context.dataSource,
        userWithBadge.id,
        testBadges[0].id,
      );

      const responseWithBadge = await authRequest(app, userWithBadge.accessToken)
        .get(`/api/v1/badges/${testBadges[0].id}`)
        .expect(200);

      expect(responseWithBadge.body.data.earned).toBe(true);
      expect(responseWithBadge.body.data.earnedAt).toBeDefined();

      // User without badge
      const userWithoutBadge = await createTestUser(app);

      const responseWithoutBadge = await authRequest(
        app,
        userWithoutBadge.accessToken,
      )
        .get(`/api/v1/badges/${testBadges[0].id}`)
        .expect(200);

      expect(responseWithoutBadge.body.data.earned).toBe(false);
      expect(responseWithoutBadge.body.data.earnedAt).toBeUndefined();
    });

    it('should return 404 for non-existent badge', async () => {
      const response = await authRequest(app, testUser.accessToken)
        .get('/api/v1/badges/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/badges/${testBadges[0].id}`)
        .expect(401);
    });
  });
});
