// Explicitly load the platform adapter so Jest can resolve it when
// createNestApplication() loads it dynamically from the test directory.
import '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('FoodController (e2e)', () => {
  let app: INestApplication<App>;
  const userId = 'e2e-user';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('supports full CRUD for a food', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/foods')
      .set('x-user-id', userId)
      .send({
        name: 'Oats',
        nutrientsPer100g: {
          calories: 389,
          protein: 16.9,
          carbs: 66.3,
          fat: 6.9,
        },
      })
      .expect(201);

    const foodId = createResponse.body.id;
    expect(foodId).toBeDefined();
    expect(createResponse.body.name).toBe('Oats');
    expect(createResponse.body.userId).toBe(userId);

    const listResponse = await request(app.getHttpServer())
      .get('/foods')
      .set('x-user-id', userId)
      .expect(200);

    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].id).toBe(foodId);

    const getResponse = await request(app.getHttpServer())
      .get(`/foods/${foodId}`)
      .set('x-user-id', userId)
      .expect(200);

    expect(getResponse.body.id).toBe(foodId);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/foods/${foodId}`)
      .set('x-user-id', userId)
      .send({ name: 'Rolled oats' })
      .expect(200);

    expect(updateResponse.body.name).toBe('Rolled oats');

    await request(app.getHttpServer())
      .delete(`/foods/${foodId}`)
      .set('x-user-id', userId)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/foods/${foodId}`)
      .set('x-user-id', userId)
      .expect(404);

    await request(app.getHttpServer())
      .get('/foods')
      .set('x-user-id', userId)
      .expect(200)
      .expect([]);
  });

  it('isolates foods between users', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/foods')
      .set('x-user-id', userId)
      .send({
        name: 'Rice',
        nutrientsPer100g: {
          calories: 130,
          protein: 2.7,
          carbs: 28,
          fat: 0.3,
        },
      })
      .expect(201);

    const foodId = createResponse.body.id;

    await request(app.getHttpServer())
      .get(`/foods/${foodId}`)
      .set('x-user-id', 'other-user')
      .expect(404);

    const listResponse = await request(app.getHttpServer())
      .get('/foods')
      .set('x-user-id', 'other-user')
      .expect(200);

    expect(listResponse.body).toEqual([]);
  });

  it('returns 404 when updating or deleting a missing food', async () => {
    await request(app.getHttpServer())
      .patch('/foods/missing-id')
      .set('x-user-id', userId)
      .send({ name: 'Tofu' })
      .expect(404);

    await request(app.getHttpServer())
      .delete('/foods/missing-id')
      .set('x-user-id', userId)
      .expect(404);
  });
});
