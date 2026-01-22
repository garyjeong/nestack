import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('Admin (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;

  const adminCredentials = {
    email: 'admin@nestack.com',
    password: 'Admin1234!@',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = app.get(DataSource);

    // Login as admin
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/admin/login')
      .send(adminCredentials);

    adminToken = loginResponse.body.data?.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/admin/login', () => {
    it('should login admin with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send(adminCredentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.admin).toHaveProperty('role');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send({
          email: adminCredentials.email,
          password: 'WrongPassword!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with non-existent admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/login')
        .send({
          email: 'notadmin@nestack.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/admin/dashboard', () => {
    it('should return dashboard stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('totalFamilyGroups');
      expect(response.body.data).toHaveProperty('totalMissions');
    });

    it('should fail without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should return user list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/users?status=active')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/admin/categories', () => {
    it('should return category list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/admin/templates', () => {
    it('should return template list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/templates')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/admin/badges', () => {
    it('should return badge list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/badges')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Announcements CRUD', () => {
    let announcementId: string;

    it('should create announcement', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Test Announcement',
          content: 'This is a test announcement',
          displayType: 'banner',
          isActive: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      announcementId = response.body.data.id;
    });

    it('should get announcements list', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/announcements')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update announcement', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/admin/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated E2E Test Announcement',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated E2E Test Announcement');
    });

    it('should get active announcements (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/announcements/active')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should delete announcement', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/announcements/${announcementId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
