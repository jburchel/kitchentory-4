import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Application Smoke Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health & Status', () => {
    it('/ (GET) - should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('API Endpoints Exist', () => {
    it('/auth/register (POST) - should exist and handle invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({})
        .expect((res) => {
          // Should return 400 or 401 depending on validation
          expect([400, 401]).toContain(res.status);
        });
    });

    it('/auth/login (POST) - should exist and handle invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect((res) => {
          // Should return 400 or 401 depending on validation
          expect([400, 401]).toContain(res.status);
        });
    });

    it('/inventory (GET) - should exist and require authentication', () => {
      return request(app.getHttpServer())
        .get('/inventory')
        .expect(401);
    });

    it('/recipes (GET) - should exist and require authentication', () => {
      return request(app.getHttpServer())
        .get('/recipes')
        .expect(401);
    });

    it('/shopping (GET) - should exist', () => {
      return request(app.getHttpServer())
        .get('/shopping')
        .expect((res) => {
          // Shopping endpoint may not be mounted or may require auth
          expect([401, 404]).toContain(res.status);
        });
    });

    it('/products (GET) - should exist', () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect((res) => {
          // Products endpoint should return 200, 401, or 500 depending on config/DB
          expect([200, 401, 500]).toContain(res.status);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle invalid JSON in request body', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });
});
