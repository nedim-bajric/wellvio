// Explicitly load the platform adapter so Jest can resolve it when
// createNestApplication() loads it dynamically from the test directory.
import '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('LogEntryController (e2e)', () => {
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

  async function createFood(name: string, calories: number) {
    const response = await request(app.getHttpServer())
      .post('/foods')
      .set('x-user-id', userId)
      .send({
        name,
        nutrientsPer100g: {
          calories,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      })
      .expect(201);
    return response.body;
  }

  it('supports full CRUD for a log entry and returns the daily dashboard', async () => {
    const food = await createFood('Rice', 130);

    const createResponse = await request(app.getHttpServer())
      .post('/log-entries')
      .set('x-user-id', userId)
      .send({
        foodId: food.id,
        grams: 100,
        mealSlot: 'lunch',
      })
      .expect(201);

    const entryId = createResponse.body.id;
    expect(createResponse.body.foodName).toBe('Rice');
    expect(createResponse.body.nutrients.calories).toBe(130);

    const listResponse = await request(app.getHttpServer())
      .get('/log-entries')
      .set('x-user-id', userId)
      .expect(200);

    expect(listResponse.body).toHaveLength(1);
    expect(listResponse.body[0].id).toBe(entryId);

    const updateResponse = await request(app.getHttpServer())
      .patch(`/log-entries/${entryId}`)
      .set('x-user-id', userId)
      .send({ grams: 200 })
      .expect(200);

    expect(updateResponse.body.grams).toBe(200);
    expect(updateResponse.body.nutrients.calories).toBe(260);

    const dashboardResponse = await request(app.getHttpServer())
      .get('/log-entries/dashboard')
      .set('x-user-id', userId)
      .expect(200);

    expect(dashboardResponse.body.totals.calories).toBe(260);
    expect(dashboardResponse.body.mealSlots).toHaveLength(4);
    const lunch = dashboardResponse.body.mealSlots.find(
      (slot: { mealSlot: string }) => slot.mealSlot === 'lunch',
    );
    expect(lunch.nutrients.calories).toBe(260);

    await request(app.getHttpServer())
      .delete(`/log-entries/${entryId}`)
      .set('x-user-id', userId)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/log-entries/${entryId}`)
      .set('x-user-id', userId)
      .expect(404);
  });

  it('isolates entries between users', async () => {
    const food = await createFood('Oats', 389);

    const createResponse = await request(app.getHttpServer())
      .post('/log-entries')
      .set('x-user-id', userId)
      .send({
        foodId: food.id,
        grams: 100,
        mealSlot: 'breakfast',
      })
      .expect(201);

    const entryId = createResponse.body.id;

    await request(app.getHttpServer())
      .get(`/log-entries/${entryId}`)
      .set('x-user-id', 'other-user')
      .expect(404);

    const listResponse = await request(app.getHttpServer())
      .get('/log-entries')
      .set('x-user-id', 'other-user')
      .expect(200);

    expect(listResponse.body).toEqual([]);
  });

  it('returns 404 when updating or deleting a missing entry', async () => {
    await request(app.getHttpServer())
      .patch('/log-entries/missing-id')
      .set('x-user-id', userId)
      .send({ grams: 200 })
      .expect(404);

    await request(app.getHttpServer())
      .delete('/log-entries/missing-id')
      .set('x-user-id', userId)
      .expect(404);
  });

  it('returns 404 when creating an entry for a missing food', async () => {
    await request(app.getHttpServer())
      .post('/log-entries')
      .set('x-user-id', userId)
      .send({
        foodId: 'missing-food',
        grams: 100,
        mealSlot: 'dinner',
      })
      .expect(404);
  });
});
