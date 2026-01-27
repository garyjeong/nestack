import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import {
  AdminRole,
  AdminStatus,
  CategoryStatus,
  BadgeType,
  BadgeConditionType,
  GoalType,
} from '../src/common/enums';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken: string;
}

export interface TestAdmin {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  accessToken: string;
}

export interface TestContext {
  app: INestApplication;
  dataSource: DataSource;
}

export interface SeedCategory {
  id: string;
  name: string;
}

export interface SeedBadge {
  id: string;
  name: string;
}

export interface SeedTemplate {
  id: string;
  name: string;
  categoryId: string;
}

/**
 * Create and initialize a NestJS application for testing
 */
export async function createTestApp(): Promise<TestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply the same global configurations as main.ts
  app.setGlobalPrefix('api/v1');

  // Enable CORS like in main.ts
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.init();

  const dataSource = moduleFixture.get<DataSource>(DataSource);

  return { app, dataSource };
}

/**
 * Clean up the test application
 */
export async function closeTestApp(context: TestContext): Promise<void> {
  await context.app.close();
}

/**
 * Clean up database tables for testing
 */
export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  const entities = dataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    // Use soft delete or truncate depending on entity
    try {
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
    } catch {
      // If truncate fails, try delete
      await repository.createQueryBuilder().delete().execute();
    }
  }
}

/**
 * Create a test user and return authentication tokens
 */
export async function createTestUser(
  app: INestApplication,
  userData?: Partial<{ email: string; password: string; name: string }>,
): Promise<TestUser> {
  const email = userData?.email || `test-${Date.now()}@example.com`;
  const password = userData?.password || 'TestPassword123!';
  const name = userData?.name || 'Test User';

  const signupResponse = await request(app.getHttpServer())
    .post('/api/v1/auth/signup')
    .send({ email, password, name })
    .expect(201);

  const { data } = signupResponse.body;

  // AuthResponseDto structure: { userId, email, name, tokens: { accessToken, refreshToken } }
  return {
    id: data.userId,
    email: data.email,
    name: data.name,
    accessToken: data.tokens.accessToken,
    refreshToken: data.tokens.refreshToken,
  };
}

/**
 * Login with existing user credentials
 */
export async function loginUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);

  // AuthResponseDto structure: { userId, email, name, tokens: { accessToken, refreshToken } }
  return {
    accessToken: response.body.data.tokens.accessToken,
    refreshToken: response.body.data.tokens.refreshToken,
  };
}

/**
 * Helper to make authenticated requests
 */
export function authRequest(
  app: INestApplication,
  accessToken: string,
): {
  get: (url: string) => request.Test;
  post: (url: string) => request.Test;
  patch: (url: string) => request.Test;
  delete: (url: string) => request.Test;
  put: (url: string) => request.Test;
} {
  const server = app.getHttpServer();
  return {
    get: (url: string) =>
      request(server).get(url).set('Authorization', `Bearer ${accessToken}`),
    post: (url: string) =>
      request(server).post(url).set('Authorization', `Bearer ${accessToken}`),
    patch: (url: string) =>
      request(server).patch(url).set('Authorization', `Bearer ${accessToken}`),
    delete: (url: string) =>
      request(server).delete(url).set('Authorization', `Bearer ${accessToken}`),
    put: (url: string) =>
      request(server).put(url).set('Authorization', `Bearer ${accessToken}`),
  };
}

/**
 * Generate unique test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  };
}

/**
 * Wait for a specified time (useful for rate limiting tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create an admin user directly in the database for testing
 */
export async function createAdminUser(
  dataSource: DataSource,
  adminData?: Partial<{
    email: string;
    password: string;
    name: string;
    role: AdminRole;
  }>,
): Promise<{ id: string; email: string; password: string; name: string; role: AdminRole }> {
  const email = adminData?.email || `admin-${Date.now()}@example.com`;
  const password = adminData?.password || 'AdminPassword123!';
  const name = adminData?.name || 'Test Admin';
  const role = adminData?.role || AdminRole.SUPER_ADMIN;

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await dataSource.query(
    `INSERT INTO admin_users (email, password_hash, name, role, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING id`,
    [email, passwordHash, name, role, AdminStatus.ACTIVE],
  );

  return {
    id: result[0].id,
    email,
    password,
    name,
    role,
  };
}

/**
 * Login as admin and return tokens
 */
export async function loginAdmin(
  app: INestApplication,
  email: string,
  password: string,
): Promise<TestAdmin> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/admin/login')
    .send({ email, password })
    .expect(200);

  const { data } = response.body;
  return {
    id: data.admin.id,
    email: data.admin.email,
    name: data.admin.name,
    role: data.admin.role,
    accessToken: data.accessToken,
  };
}

/**
 * Create a lifecycle category for testing
 */
export async function createCategory(
  dataSource: DataSource,
  categoryData?: Partial<{ name: string; displayOrder: number }>,
): Promise<SeedCategory> {
  const name = categoryData?.name || `Test Category ${Date.now()}`;
  const displayOrder = categoryData?.displayOrder || 0;

  const result = await dataSource.query(
    `INSERT INTO lifecycle_categories (name, display_order, status, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING id, name`,
    [name, displayOrder, CategoryStatus.ACTIVE],
  );

  return { id: result[0].id, name: result[0].name };
}

/**
 * Create a mission template for testing
 */
export async function createTemplate(
  dataSource: DataSource,
  categoryId: string,
  templateData?: Partial<{ name: string; description: string; defaultGoalAmount: number }>,
): Promise<SeedTemplate> {
  const name = templateData?.name || `Test Template ${Date.now()}`;
  const description = templateData?.description || 'Test template description';
  const defaultGoalAmount = templateData?.defaultGoalAmount || 1000000;

  const result = await dataSource.query(
    `INSERT INTO mission_templates (name, description, category_id, goal_type, default_goal_amount, status, usage_count, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, 0, NOW(), NOW())
     RETURNING id, name`,
    [name, description, categoryId, GoalType.AMOUNT, defaultGoalAmount, CategoryStatus.ACTIVE],
  );

  return { id: result[0].id, name: result[0].name, categoryId };
}

/**
 * Create a badge for testing
 */
export async function createBadge(
  dataSource: DataSource,
  badgeData?: Partial<{
    name: string;
    description: string;
    badgeType: BadgeType;
    conditionType: BadgeConditionType;
    conditionValue: Record<string, any>;
  }>,
): Promise<SeedBadge> {
  const name = badgeData?.name || `Test Badge ${Date.now()}`;
  const description = badgeData?.description || 'Test badge description';
  const badgeType = badgeData?.badgeType || BadgeType.ACHIEVEMENT;
  const conditionType = badgeData?.conditionType || BadgeConditionType.MISSION_COMPLETE;
  const conditionValue = badgeData?.conditionValue || { count: 1 };

  const result = await dataSource.query(
    `INSERT INTO badges (name, description, badge_type, condition_type, condition_value, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     RETURNING id, name`,
    [name, description, badgeType, conditionType, JSON.stringify(conditionValue), CategoryStatus.ACTIVE],
  );

  return { id: result[0].id, name: result[0].name };
}

/**
 * Issue a badge to a user
 */
export async function issueBadgeToUser(
  dataSource: DataSource,
  userId: string,
  badgeId: string,
  issuedBy?: string,
): Promise<string> {
  const result = await dataSource.query(
    `INSERT INTO user_badges (user_id, badge_id, issue_type, issued_by, issued_at)
     VALUES ($1, $2, 'MANUAL', $3, NOW())
     RETURNING id`,
    [userId, badgeId, issuedBy || null],
  );

  return result[0].id;
}

/**
 * Create test data for comprehensive testing
 */
export interface TestSeedData {
  categories: SeedCategory[];
  templates: SeedTemplate[];
  badges: SeedBadge[];
}

export async function seedTestData(dataSource: DataSource): Promise<TestSeedData> {
  // Create categories
  const categories: SeedCategory[] = [
    await createCategory(dataSource, { name: '주거', displayOrder: 1 }),
    await createCategory(dataSource, { name: '결혼', displayOrder: 2 }),
    await createCategory(dataSource, { name: '출산/육아', displayOrder: 3 }),
    await createCategory(dataSource, { name: '교육', displayOrder: 4 }),
    await createCategory(dataSource, { name: '노후', displayOrder: 5 }),
  ];

  // Create templates for each category
  const templates: SeedTemplate[] = [];
  templates.push(
    await createTemplate(dataSource, categories[0].id, {
      name: '전세 자금 모으기',
      description: '전세 자금을 위한 저축 미션',
      defaultGoalAmount: 50000000,
    }),
  );
  templates.push(
    await createTemplate(dataSource, categories[1].id, {
      name: '결혼 자금 모으기',
      description: '결혼 비용을 위한 저축 미션',
      defaultGoalAmount: 30000000,
    }),
  );

  // Create badges
  const badges: SeedBadge[] = [];
  badges.push(
    await createBadge(dataSource, {
      name: '첫 미션 달성',
      description: '첫 번째 미션을 완료했습니다',
      badgeType: BadgeType.ACHIEVEMENT,
      conditionType: BadgeConditionType.MISSION_COMPLETE,
      conditionValue: { count: 1 },
    }),
  );
  badges.push(
    await createBadge(dataSource, {
      name: '100만원 저축',
      description: '총 저축액이 100만원에 도달했습니다',
      badgeType: BadgeType.ACHIEVEMENT,
      conditionType: BadgeConditionType.SAVINGS_AMOUNT,
      conditionValue: { amount: 1000000 },
    }),
  );
  badges.push(
    await createBadge(dataSource, {
      name: '첫 미션 시작',
      description: '첫 미션을 시작했습니다',
      badgeType: BadgeType.LIFECYCLE,
      conditionType: BadgeConditionType.FIRST_ACTION,
      conditionValue: { actionType: 'mission' },
    }),
  );
  badges.push(
    await createBadge(dataSource, {
      name: '가족과 함께',
      description: '가족 그룹에 참여했습니다',
      badgeType: BadgeType.SPECIAL,
      conditionType: BadgeConditionType.FIRST_ACTION,
      conditionValue: { actionType: 'family' },
    }),
  );

  return { categories, templates, badges };
}

/**
 * Clean specific tables for testing
 */
export async function cleanTables(
  dataSource: DataSource,
  tables: string[],
): Promise<void> {
  for (const table of tables) {
    try {
      await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
    } catch {
      // Ignore errors if table doesn't exist
    }
  }
}
