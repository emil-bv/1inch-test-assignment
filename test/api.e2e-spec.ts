import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import request from 'supertest';
import jestOpenAPI from 'jest-openapi';
import type { OpenAPIV3 } from 'openapi-types';

import { AppModule } from '@modules/app/app.module';
import { setupSwagger } from '@bootstrap/setup/swagger.setup';

describe('api (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    setupSwagger(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    const res = await request(app.getHttpServer()).get('/docs-json');
    const openapi = res.body as unknown as OpenAPIV3.Document;
    jestOpenAPI(openapi);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('root', () => {
    it('GET /', async () => {
      const res = await request(app.getHttpServer()).get('/').expect(200);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('health', () => {
    it('GET /health/live', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/live')
        .expect(200);
      expect(res).toSatisfyApiSpec();
    });
    it('GET /health/ready', async () => {
      const res = await request(app.getHttpServer())
        .get('/health/ready')
        .expect(200);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('gas', () => {
    it('GET /gas/price', async () => {
      const res = await request(app.getHttpServer())
        .get('/gas/price')
        .expect(200);
      expect(res).toSatisfyApiSpec();
    });
  });

  describe('amm', () => {
    it('GET /amm/quote/:from/:to/:amount', async () => {
      const res = await request(app.getHttpServer())
        .get(
          '/amm/quote/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/1',
        )
        .expect(200);
      expect(res).toSatisfyApiSpec();
    });
  });
});
